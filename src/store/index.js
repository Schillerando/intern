import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import router from '../router';
import { supabase } from '../supabase';

const store = createStore({
  state: {
    user: null,
    session: null,
    state: undefined,
    userCompany: null,
    currentProduct: null,
    currentEntry: null,
    orders: [],
    services: []
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setState(state, payload) {
      state.state = payload;
    },
    setUserCompany(state, payload) {
      state.userCompany = payload;
    },
    setCurrentProduct(state, payload) {
      state.currentProduct = payload;
    },
    setCurrentEntry(state, payload) {
      state.currentEntry = payload;
    },
    setOrders(state, payload) {
      state.orders = payload;
    },
    setServices(state, payload) {
      state.services = payload;
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getState(state) {
      return state.state;
    },
    getUserCompany(state) {
      return state.userCompany;
    },
    getCurrentProduct(state) {
      return state.currentProduct;
    },
    getCurrentEntry(state) {
      return state.currentEntry;
    },
    getOrders(state) {
      return state.orders
    },
    getServices(state) {
      return state.services
    },
  },
  actions: {
    async reload({ commit }) {
      console.log('reload')

      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      isSafari = true;

      try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error || data.session == null) {

          if(isSafari) {
            commit('setUser', null);
          } else this.dispatch('getSharedLogin')
          
        } else {
          var user = data.user
          if(this.state.user != null) user.role = this.state.user.role
          commit('setUser', user)
          this.dispatch('startServiceSubscription')
        }
      } catch(e) {
        commit('setUser', null);
      }

      if(this.state.user != null && this.state.user.role != 'admin' && this.state.user.role != 'driver') {
        user = this.getters.getUser

        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select()
            .eq('id', user.id)
    
          if(error) throw error;
    
          if(data != null) user.role = data[0].role
    
        } catch(e) {
          console.log(e)
        }

        commit('setUser', user)
      }

      if(this.state.user != null) this.dispatch('startOrderSubscription');

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
    async startOrderSubscription({ commit }) {
      try {

        const { data, error } = await supabase
          .from('orders')
          .select()

        if(error != null) throw error

        var orders = data
        
        console.log(orders)

        {
          const { data, error } = await supabase
            .from('order_products')
            .select()

          if (error) throw error;

          console.log(data)

          data.forEach((product) => {
            var index = orders.findIndex((o) => o.id == product.order);
            console.log(product)

            if(index != -1) {
              if (orders[index].order_products == undefined) orders[index].order_products = [];
              orders[index].order_products.push(product);
            }
            
            
          });
        }

        commit('setOrders', orders);

        const orderSubscription = supabase.channel('any').on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          async (payload) => {
            
            var orders = this.state.orders

            var index = orders.findIndex(order => order.id == payload.new.id)

            if (index != -1) {
              var newOrder = payload.new;

              newOrder.order_products = orders[index].order_products;

              orders[index] = newOrder;
            }
            else orders.push(payload.new)

            if(error != null) throw error

            console.log('Database change received!', payload.new);
            commit('setOrders', orders);
          }
        );

        orderSubscription.subscribe();
      } catch (error) {
        commit('setOrders', []);
        console.log(error.error_description || error.message);
      }
    },

    async stopOrderSubscription() {
      try {
        await supabase.removeAllChannels();
      } catch (error) {
        console.log(error.error_description || error.message);
      }
    },
    async startServiceSubscription({ commit }) {
      try {

        const { data, error } = await supabase
          .from('booked_services')
          .select('*, companies(*)')

        if(error != null) throw error

        commit('setServices', data)

        const orderSubscription = supabase.channel('any').on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booked_services',
          },
          async (payload) => {
            
            var services = this.state.services

            var newService = payload.new

            const { data, error } = await supabase
              .from('companies')
              .select()
              .eq('id', newService.company)

            if(error != null) throw error

            newService.companies = data[0]

            var index = services.findIndex(service => service.id == newService.id)

            if(index != -1) services[index] = newService
            else services.push(newService)

            if(error != null) throw error

            console.log('Database change received!', newService);
            commit('setOrders', services);
          }
        );

        orderSubscription.subscribe();
      } catch (error) {
        commit('setServices', []);
        console.log(error.error_description || error.message);
      }
    },

    async stopServiceSubscription() {
      try {
        await supabase.removeAllChannels();
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

        await router.replace('/einstellungen');
      } catch (error) {
        commit('setState', 'failure');
        console.log(error.error_description || error.message);
      }
    },
    async addProduct({ commit }, product) {
      try {
        commit('setState', 'loading');

        const { data, error } = await supabase.from('products').insert({
          name: product.name,
          info: product.info,
          categories: product.categories,
          price: product.price,
          delivery: product.delivery,
          public: product.public, 
          auth_uid: this.getters.getUser.id,
          company_id: this.getters.getUserCompany.id,
          has_variations: product.has_variations,
          has_extras: product.has_extras,
        })
        .select()

        if (error) throw error;

        commit('setCurrentProduct', data[0])

        if (product.image != null) {

          var type = product.image.substring(product.image.indexOf(':'), product.image.indexOf(';')).replace(':', '')
          var fileName = data[0].id + '.' + type.split('/')[1]

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
              .eq('id', this.getters.getCurrentProduct.id)
              .select()

            if (error) throw error;

            commit('setCurrentProduct', data[0])
          }
        }

        if(product.has_variations) {

          for(var i = 0; i < product.variations.length; i++) {

            const { error } = await supabase  
              .from('product_variations')
              .insert({
                name: product.variations[i].name,
                price: product.variations[i].price,
                product: data[0].id
              }) 

            if(error) throw error

            product.variations[i].new = false
          }
        }

        if(product.has_extras) {
          for(i = 0; i < product.extras.length; i++) {
            const { error } = await supabase  
              .from('product_extras')
              .insert({
                name: product.extras[i].name,
                extra_price: product.extras[i].extra_price,
                product: data[0].id
              }) 

            if(error) throw error

            product.extras[i].new = false
          }
        }

        var newProduct = data[0]
        newProduct.variations = product.variations
        newProduct.extras = product.extras
        commit('setCurrentProduct', newProduct)

        commit('setState', 'success');
      } catch (error) {
        commit('setCurrentProduct', null)
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
          public: product.public,
          has_variations: product.has_variations,
          has_extras: product.has_extras
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

        {
          const { data, error } = await supabase
            .from('product_variations')
            .select()
            .eq('product', product.id)
            
          if(error) throw error;

          var oldVariations = data
        }

        var variationIDs = []
        if(product.has_variations) {
          for (var i = 0; i < product.variations.length; i++) {
            variationIDs.push(product.variations[i].id)

            if (product.variations[i].new) {

              const { error } = await supabase  
                .from('product_variations')
                .insert({
                  name: product.variations[i].name,
                  price: product.variations[i].price,
                  product: this.state.currentProduct.id
                }) 

              if(error) throw error

              product.variations[i].new = false
            } else {
              var index = oldVariations.findIndex(variation => variation.id === product.variations[i].id)

              if(index != -1 && (oldVariations[index].name != product.variations[i].name || oldVariations[index].price != product.variations[i].price)) {
                const { error } = await supabase  
                  .from('product_variations')
                  .update({
                    name: product.variations[i].name,
                    price: product.variations[i].price,
                  }) 
                  .eq('id', product.variations[i].id)

                if(error) throw error
              }

            }
          }
        }

        console.log(1)

        for(i = 0; i < oldVariations.length; i++) {
          if(!variationIDs.includes(oldVariations[i].id)) {
            const { error } = await supabase  
              .from('product_variations')
              .delete()
              .eq('id', oldVariations[i].id)

            if(error) throw error
          }
        }

        console.log(2)
        

        {
          const { data, error } = await supabase
            .from('product_extras')
            .select()
            .eq('product', product.id)
            
          if(error) throw error;

          var oldExtras = data
        }

        var extraIDs = []
        if(product.has_extras) {
          for (i = 0; i < product.extras.length; i++) {
            extraIDs.push(product.extras[i].id)

            if (product.extras[i].new) {
              const { error } = await supabase  
                .from('product_extras')
                .insert({
                  name: product.extras[i].name,
                  extra_price: product.extras[i].extra_price,
                  product: this.state.currentProduct.id
                }) 

              if(error) throw error

              product.extras[i].new = false
            } else {
              index = oldExtras.findIndex(extra => extra.id === product.extras[i].id)

              if(index != -1 && (oldExtras[index].name != product.extras[i].name || oldExtras[index].extra_price != product.extras[i].extra_price)) {
                const { error } = await supabase  
                  .from('product_extras')
                  .update({
                    name: product.extras[i].name,
                    extra_price: product.extras[i].extra_price,
                  }) 
                  .eq('id', product.variations[i].id)         
                  
                  if(error) throw error

              }
              
            }
          }
        }

        for(i = 0; i < oldExtras.length; i++) {
          if(!extraIDs.includes(oldExtras[i].id)) {
            const { error } = await supabase  
              .from('product_extras')
              .delete()
              .eq('id', oldExtras[i].id)

            if(error) throw error
          }
        }

        var newProduct = this.state.currentProduct
        newProduct.variations = product.variations
        newProduct.extras = product.extras
        commit('setCurrentProduct', newProduct)

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

    async addEntry({ commit }, entry) {
      try {
        console.log(entry)

        commit('setState', 'loading');

        const { data, error } = await supabase.from('accounting').insert({
          name: entry.name,
          info: entry.info,
          type: entry.type,
          amount: entry.type.includes('-') ? -Math.abs(entry.amount) : Math.abs(entry.amount),
          product: entry.product.id,
          user_id: this.getters.getUser.id,
          company_id: this.getters.getUserCompany.id,
          currencyIsEuro: entry.currencyIsEuro,
          variation: entry.variation != '' ? entry.variation : null,
          extras: entry.extras.length > 0 ? entry.extras : null
        })
        .select()

        if (error) throw error;

        commit('setCurrentEntry', data[0])

        if (entry.image != null) {

          var type = entry.image.substring(entry.image.indexOf(':'), entry.image.indexOf(';')).replace(':', '')
          var fileName = data[0].id + '.' + type.split('/')[1]

          {
            console.log(entry.image)

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
              .eq('id', this.getters.getCurrentEntry.id)
              .select()

            if (error) throw error;

            commit('setCurrentEntry', data[0])
          }
          
        }

        const newEntry = this.getters.getCurrentEntry
        newEntry.userName = this.getters.getUser.user_metadata.name
        console.log(newEntry.userName)
        commit('setCurrentEntry', newEntry)

        commit('setState', 'success');
      } catch (error) {
        commit('setCurrentEntry', null)
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
          currencyIsEuro: entry.currencyIsEuro,
          variation: entry.variation != '' ? entry.variation : null,
          extras: entry.extras.length > 0 ? entry.extras : null
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
