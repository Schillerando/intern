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
import UpdateAboView from '../views/UpdateAboView';
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
      company: true
    },
  },
  {
    path: '/services',
    name: 'ServiceView',
    component: ServiceView,
    meta: {
      locked: true,
      company: true
    },
  },
  {
    path: '/buchhaltung',
    name: 'AccountingView',
    component: AccountingView,
    meta: {
      locked: true,
      company: true
    },
  },
  {
    path: '/einstellungen',
    name: 'SettingsView',
    component: SettingsView,
    meta: {
      locked: true,
      company: true,
      noAccess: true,
    },
  },
  {
    path: '/auth',
    name: 'AuthView',
    component: AuthView,
    meta: {
      footer: false,
      auth: false
    },
  },
  {
    path: '/companyRegistration',
    name: 'CompanyRegistrationView',
    component: CompanyRegistrationView,
    meta: {
      footer: false,
      company: false,
      auth: true
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
  },
  {
    path: '/updateAbo',
    name: 'UpdateAboView',
    component: UpdateAboView,
    meta: {
      footer: false,
      company: true
    },
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

  console.log(user)
  console.log(userCompany)
  console.log(to.meta.auth)
  console.log(to.meta.company)

  if(to.name != 'HomeView' && to.name != 'AGBView' && user.email_confirmed_at == null) next({ path: '' })
  else if((to.meta.auth || to.meta.company) && user == null) next({ path: 'auth', query: { redirect: to.fullPath } });
  else if(to.meta.company && userCompany == null) next({ path: 'companyRegistration' });
  else if(to.meta.company == false && userCompany != null) next({ path: from.path })
  else if(to.meta.auth == false && user != null) next({ path: from.path })
  else if(to.name == 'UpdateAboView' && userCompany != null && userCompany.abo != '' && userCompany.abo != null) next({ path: from.path })
  else next();
});

export default router;
