import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import router from '../router';
import { supabase } from '../supabase';

const store = createStore({
  state: {
    user: null,
    session: null,
    state: undefined,
    currentProduct: null,
    currentEntry: null
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setState(state, payload) {
      state.state = payload;
    },
    setCurrentProduct(state, payload) {
      state.currentProduct = payload;
    },
    setCurrentEntry(state, payload) {
      state.currentEntry = payload;
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getState(state) {
      return state.state;
    },
    getCurrentProduct(state) {
      return state.currentProduct;
    },
    getCurrentEntry(state) {
      return state.currentEntry;
    },
  },
  actions: {
    async reload({ commit }) {
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      isSafari = true;

      try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error || data.session == null) {

          if(isSafari) {
            commit('setUser', null);
          } else this.dispatch('getSharedLogin')
          
        } else {
          if(this.state.getUser == null) commit('setUser', data.user);
          console.log(this.state.getUser.role)
        }
      } catch(e) {
        commit('setUser', null);
      }
      

      if(!isSafari) {
        this.timer = setInterval(() => {
          this.dispatch('getSharedLogin')
        }, 1000)
      }
    },
    
    async getSharedLogin({ commit }) {
      const cookies = document.cookie.split(/\s*;\s*/).map(cookie => cookie.split('='));
      const accessTokenCookie = cookies.find(x => x[0] == 'supabase-access-token');
      const refreshTokenCookie = cookies.find(x => x[0] == 'supabase-refresh-token');
      if (accessTokenCookie && refreshTokenCookie) {        
        if(this.getters.getUser != null) return;

        const { data, error } = await supabase.auth.setSession({
          access_token: accessTokenCookie[1],
          refresh_token: refreshTokenCookie[1],
        })

        if (error || data.session == null) {
          commit('setUser', null);

          document.cookie = `supabase-access-token=false;`;
          document.cookie = `supabase-refresh-token=false;`;

          router.go(router.currentRoute);
        } else {
          if (this.getters.getUser != null) {
            commit('setUser', data.user);
          } else {
            commit('setUser', data.user);

            router.go(router.currentRoute);
          }

        }
      }
      else if (this.getters.getUser != null) {
        commit('setUser', null);
        router.go(router.currentRoute);
      } else {
        commit('setUser', null);
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
          info: form.info,
          user_uid: this.getters.getUser.id,
          employees: uniqueEmployees,
          abo: form.abo == 'Later' ? null : form.abo,
          relevance: form.abo == 'Business' ? 50 : 100
        })
        .select();

        var companyId = data[0].id

        if (error) throw error;

        if (form.image != null) {
          var type = form.image.substring(form.image.indexOf(':'), form.image.indexOf(';')).replace(':', '')
          var fileName = data[0].id + '.' + type.split('/')[1]

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

          {
            const { error } = await supabase
              .from('companies')
              .update({ header_picture: fileName })
              .eq('id', this.getters.companyId)

              if (error) throw error;
          }
        }


        {

          if (error) throw error;
          commit('setUser', data.user);
        }

        for (var i = 0; i < form.products.length; i++) {
          const product = form.products[i];

          const { data, error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              info: product.info,
              price: product.price,
              categories: product.categories,
              company_id: companyId,
              auth_uid: this.getters.getUser.id,
              delivery: product.delivery,
              public: product.public
            })
            .select();

          if (error) throw error;

          if (product.image != null) {
            var imageType = product.image.substring(product.image.indexOf(':'), product.image.indexOf(';')).replace(':', '')
            var imageName = data[0].id + '.' + type.split('/')[1]
  
            {
              const { error } = await supabase
                .storage
                .from('products-pictures')
                .upload(imageName, product.image, {
                  cacheControl: '3600',
                  upsert: true,
                  contentType: imageType
                })
  
              if (error) throw error;
  
            }
  
            {
              const { error } = await supabase
                .from('products')
                .update({ product_picture: imageName })
                .eq('id', data[0].id)
  
                if (error) throw error;
            }
          }

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
    async updateProduct({ commit }, product) {
      try {
        commit('setState', 'loading');

        const { data, error } = await supabase.from('products').update({
          name: product.name,
          info: product.info,
          categories: product.categories,
          price: product.price,
          delivery: product.delivery,
          public: product.public
        })
        .eq('id', product.id)
        .select()

        if (error) throw error;

        commit('setCurrentProduct', data[0])

        if (product.image != null && product.imageBefore != product.image) {

          if(product.imageBefore != null){
            const { error } = await supabase
              .storage
              .from('products-pictures')
              .remove(data[0].product_picture)

            if (error) throw error;
          }

          var type = product.image.substring(product.image.indexOf(':'), product.image.indexOf(';')).replace(':', '')
          var fileName = product.id + '.' + type.split('/')[1]

          {
            const { error } = await supabase
              .storage
              .from('products-pictures')
              .upload(fileName, product.image, {
                cacheControl: '3600',
                upsert: true,
                contentType: type
              })

            if (error) throw error;

          }

          {
            const { data, error } = await supabase
              .from('products')
              .update({ product_picture: fileName })
              .eq('id', product.id)
              .select()

              if (error) throw error;

              commit('setCurrentProduct', data[0])
          }
        }

        commit('setState', 'success');
      } catch (error) {
        commit('setCurrentProduct', null)
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
    async deleteProduct({ commit }, product) {
      try {
        commit('setState', 'loading');

        if (product.product_picture != null) {

          {
            const { error } = await supabase
              .storage
              .from('products-pictures')
              .remove(product.product_picture)

            if (error) throw error;
          }
        }

        const { error } = await supabase.from('products')
          .delete()
          .eq('id', product.id)

        if (error) throw error;

        commit('setState', 'success');
      } catch (error) {
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
    async updateEntry({ commit }, entry) {
      try {
        commit('setState', 'loading');

        const { data, error } = await supabase.from('accounting').update({
          name: entry.name,
          info: entry.info,
          type: entry.type,
          amount: entry.type.includes('-') ? -Math.abs(entry.amount) : Math.abs(entry.amount),
          product: entry.product.id,
        })
        .eq('id', entry.id)
        .select()

        if (error) throw error;

        commit('setCurrentEntry', data[0])

        if (entry.image != null && entry.imageBefore != entry.image) {

          if(entry.imageBefore != null) {
            const { error } = await supabase
              .storage
              .from('bill-pictures/' + this.getters.getUserCompany.id)
              .remove(data[0].bill_picture)

            if (error) throw error;
          }

          var type = entry.image.substring(entry.image.indexOf(':'), entry.image.indexOf(';')).replace(':', '')
          var fileName = entry.id + '.' + type.split('/')[1]

          {
            const { error } = await supabase
              .storage
              .from('bill-pictures/' + this.getters.getUserCompany.id)
              .upload(fileName, entry.image, {
                cacheControl: '3600',
                upsert: true,
                contentType: type
              })

            if (error) throw error;

          }

          {
            const { data, error } = await supabase
              .from('accounting')
              .update({ bill_picture: fileName })
              .eq('id', entry.id)
              .select()

              if (error) throw error;

              commit('setCurrentEntry', data[0])
          }
        }

        commit('setState', 'success');
      } catch (error) {
        commit('setCurrentEntry', null)
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
    async deleteEntry({ commit }, entry) {
      try {
        commit('setState', 'loading');

        if (entry.product_picture != null) {

          {
            const { error } = await supabase
              .storage
              .from('bill-pictures/' + this.getters.getUserCompany.id)
              .remove(entry.bill_picture)

            if (error) throw error;
          }
        }

        const { error } = await supabase.from('accounting')
          .delete()
          .eq('id', entry.id)

        if (error) throw error;

        commit('setState', 'success');
      } catch (error) {
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    }
  },

  modules: {},

  plugins: [createPersistedState()],
});

export default store;
