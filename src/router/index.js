import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView';
import ProductView from '../views/ProductView';
import ServiceView from '../views/ServiceView';
import SettingsView from '../views/SettingsView';
import AuthView from '../views/AuthView';
import CompanyRegistrationView from '../views/CompanyRegistrationView';
import UpdatePasswordView from '../views/UpdatePasswordView';
import AccountingView from '../views/AccountingView';
import AGBView from '../views/AGBView';
import store from '../store/index';

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView,
  },
  {
    path: '/produkte',
    name: 'ProductView',
    component: ProductView,
    meta: {
      locked: true,
    },
  },
  {
    path: '/services',
    name: 'ServiceView',
    component: ServiceView,
    meta: {
      locked: true,
    },
  },
  {
    path: '/buchhaltung',
    name: 'AccountingView',
    component: AccountingView,
    meta: {
      locked: true,
    },
  },
  {
    path: '/einstellungen',
    name: 'SettingsView',
    component: SettingsView,
    meta: {
      locked: true,
    },
  },
  {
    path: '/auth',
    name: 'AuthView',
    component: AuthView,
    meta: {
      footer: false,
    },
  },
  {
    path: '/companyRegistration',
    name: 'CompanyRegistrationView',
    component: CompanyRegistrationView,
    meta: {
      footer: false,
    },
  },
  {
    path: '/update-password',
    name: 'UpdatePasswordView',
    component: UpdatePasswordView,
    meta: {
      footer: false,
    },
  },
  {
    path: '/agb',
    name: 'AGBView',
    component: AGBView,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('navbarToggler').classList.remove('show');
  },
});

router.beforeEach((to, from, next) => {
  // get current user info
  const user = store.getters.getUser;
  const userCompany = store.getters.getUserCompany;

  if(user == null && (to.name == 'AuthView' || to.name == 'AGBView' | to.name == 'HomeView')) next();
  else if (user == null && userCompany == null && to.name != 'AuthView') 
    next({ path: 'auth', query: { redirect: to.fullPath } });
  else if (userCompany == null) next({ path: 'companyRegistration' });
  //company Registration verhindern wenn company schon vorhanden
  else next();
});

export default router;
