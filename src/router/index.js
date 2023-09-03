import { createRouter, createWebHistory } from 'vue-router';
import CompanyDetailView from '../views/CompanyDetailView';
import OrderDetailView from '../views/OrderDetailView';
import UserDetailView from '../views/UserDetailView';
import CompanyView from '../views/CompanyView';
import ServiceView from '../views/ServiceView';
import SettingsView from '../views/SettingsView';
import OrderView from '../views/OrderView';
import UserView from '../views/UserView';
import StatsView from '../views/StatsView';
import store from '../store/index';
import { supabase } from '../supabase';


const routes = [
  {
    path: '/',
    alias: ['/stats'],
    name: 'StatsView',
    component: StatsView,
  },
  {
    path: '/orders',
    name: 'OrderView',
    component: OrderView,
  },
  {
    path: '/services',
    name: 'ServiceView',
    component: ServiceView,
  },
  {
    path: '/companies',
    name: 'CompanyView',
    component: CompanyView,
  },
  {
    path: '/users',
    name: 'UserView',
    component: UserView,
  },
  {
    path: '/settings',
    name: 'SettingsView',
    component: SettingsView,
    meta: {
      locked: true,
      noAccess: true,
    },
  },
  {
    path: '/:companyalias',
    component: CompanyDetailView,
    meta: {
      footer: false,
    },
  },
  {
    path: '/orders/:orderid',
    component: OrderDetailView,
    meta: {
      footer: false,
      locked: true,
      noAccess: true,
    },
  },
  {
    path: '/users/:userid',
    component: UserDetailView,
    meta: {
      footer: false,
      locked: true,
      noAccess: true,
    },
  },


];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('navbarToggler').classList.remove('show');
  },
});

router.beforeEach(async (to, from, next) => {


  if (to.query.int == 'true' && to.query.access_token != null && to.query.access_token != "null") {
    try {
      var newUser = null
      {
        const { data } = await supabase.auth.setSession({
          access_token: to.query.access_token,
          refresh_token: to.query.refresh_token,
        })

        newUser = data.user
      }

      {
        
        console.log(newUser)

        const { data, error } = await supabase
          .from('user_roles')
          .select()
          .eq('id', newUser.id)

        if(error) throw error;

        if(data != null) newUser.role = data[0].role
      }
      
      store.commit('setUser', newUser);
      store.dispatch('startOrderSubscription');
    } catch(e) {
      store.commit('setUser', null);
    }
    
  } else if(to.query.int == 'true') {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // get current user info
  var user = store.getters.getUser;

  if (user == null) {
    window.location.replace(process.env.VUE_APP_MAIN_URL + '/auth?redirect=int_' + to.path)
    next()
  }
  else if(user.role != 'admin' && user.role != 'driver') {
    window.location.replace(process.env.VUE_APP_MAIN_URL)
    next()
  }
  else next();

});

export default router;
