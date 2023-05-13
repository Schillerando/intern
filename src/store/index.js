import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import router from '../router';
import { supabase } from '../supabase';

const store = createStore({
  state: {
    user: null,
    session: null,
    userCompany: null,
    state: undefined,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setUserCompany(state, payload) {
      state.userCompany = payload;
    },
    setState(state, payload) {
      state.state = payload;
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getUserCompany(state) {
      return state.userCompany;
    },
    getState(state) {
      return state.state;
    },
  },
  actions: {
    async reload({ commit }) {
      const { data, error } = await supabase.auth.refreshSession();

      if (error || data.session == null) {
        commit('setUser', null);
        this.dispatch('getSharedLogin')
      } else {
        commit('setUser', data.user);
        this.dispatch('startUserCompanySubscription');
      }

      this.timer = setInterval(() => {
        this.dispatch('getSharedLogin')
      }, 1000)
    },
    
    async getSharedLogin({ commit }) {
      const cookies = document.cookie.split(/\s*;\s*/).map(cookie => cookie.split('='));
      const accessTokenCookie = cookies.find(x => x[0] == 'supabase-access-token');
      const refreshTokenCookie = cookies.find(x => x[0] == 'supabase-refresh-token');
      if (accessTokenCookie && refreshTokenCookie) {
        if (this.getters.getUser != null) return
        const { data, error } = await supabase.auth.setSession({
          access_token: accessTokenCookie[1],
          refresh_token: refreshTokenCookie[1],
        })

        if (error || data.session == null) {
          commit('setUser', null);
          commit('setUserCompany', null);
          const expires = new Date(0).toUTCString()
          let domain = new URL(process.env.VUE_APP_MAIN_URL).hostname
          document.cookie = `supabase-access-token=; Domain=${domain}; path=/; expires=${expires}; SameSite=Lax; secure`
          document.cookie = `supabase-refresh-token=; Domain=${domain}; path=/; expires=${expires}; SameSite=Lax; secure`
          router.go(router.currentRoute);
        } else {
          commit('setUser', data.user);
          this.dispatch('startUserCompanySubscription');

          router.go(router.currentRoute);
        }
      }
      else if (this.getters.getUser != null) {
        commit('setUser', null);
        commit('setUserCompany', null);
        router.go(router.currentRoute);
      } else {
        commit('setUserCompany', null);
        commit('setUser', null);
      }
    },
    async startUserCompanySubscription({ commit }) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select()
          .or(
            'user_uid.eq.' +
            this.getters.getUser.id +
            ',employees.cs.' +
            '{"' +
            this.getters.getUser.email +
            '"}'
          );

        if (error) throw error;

        commit('setUserCompany', null);
        if (data[0] == null) return;

        commit('setUserCompany', data[0]);

        const companySubscription = supabase.channel('any').on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'companies',
            filter: 'id=eq.' + this.getters.getUserCompany.id,
          },
          (payload) => {
            console.log('Database change received!', payload.new);
            commit('setUserCompany', payload.new);
          }
        );

        companySubscription.subscribe();
      } catch (error) {
        console.log(error.error_description || error.message);
      }
    },

    async stopUserCompanySubscription({ commit }) {
      try {
        await supabase.removeAllChannels();
        commit('setUserCompanySubscription', null);
      } catch (error) {
        console.log(error.error_description || error.message);
      }
    },

    async createCompany({ commit }, form) {
      try {
        commit('setState', 'loading');

        const alias = form.name.replace(/\s/g, '').toLowerCase()

        var uniqueEmployees = form.employees.filter(function (item, pos) {
          return form.employees.indexOf(item) == pos;
        })

        const { data, error } = await supabase.from('companies').insert({
          alias: alias,
          name: form.name,
          categories: [form.category],
          location: form.location,
          info: form.description,
          user_uid: this.getters.getUser.id,
          employees: uniqueEmployees,
          abo: form.abo,
        });

        if (form.image != null) {
          var type = form.image.substring(form.image.indexOf(':'), form.image.indexOf(';')).replace(':', '')
          var fileName = data.id + '.' + type.split('/')[1]

          {
            const { error } = await supabase
              .storage
              .from('sellers-headings')
              .upload(fileName, form.image, {
                cacheControl: '3600',
                upsert: true,
                contentType: type
              })

            if (error) throw error;

          }
        }


        {
          const { data, error } = await supabase.auth.updateUser({
            data: { isCompanyLeader: true },
          });

          if (error) throw error;
          commit('setUser', data.user);
        }

        if (error) throw error;

        for (var i = 0; i < form.products.length; i++) {
          const product = form.products[i];

          const { data, error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              info: product.description,
              price: product.price,
              categories: product.categories,
              company_id: data.id,
              auth_uid: this.getters.getUser.id,
            })
            .select();

          if (error) throw error;

        }

        console.log('Successfully registered');

        commit('setState', 'success');

        this.dispatch('startUserCompanySubscription');

        await router.replace('/einstellungen');
      } catch (error) {
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
    async updateAbo({ commit }, form) {
      try {
        commit('setState', 'loading');

        const { error } = await supabase.from('companies').update({
          abo: form.abo
        })
          .eq('id', this.getters.getUserCompany.id);

        if (error) throw error;

        commit('setState', 'success');

        router.back();
      } catch (error) {
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
  },

  modules: {},

  plugins: [createPersistedState()],
});

export default store;
