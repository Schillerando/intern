<template>
  <div v-if="!loading" class="row">
    
    <div class="col-lg-6 col-xl-4">
      <div class="overview">
        <UserTile :data="user" :noHover="true"></UserTile>
        <button class="btn btn-primary mail" @click="mailSelected">
          <i class="fa-solid fa-envelope fa-lg"></i>
          Mail
        </button>
      </div>
    </div>

    <div v-if="user.company != undefined" class="col-lg-6 col-xl-4">
      <CompanyTile :data="user.company"></CompanyTile>
    </div>

    <div v-if="user.orders != undefined" class="col-lg-6 col-xl-4">

      <div v-for="order in user.orders" :key="order.id" class="orders">
        <OrderTile :data="order" :drivers="drivers"></OrderTile>
      </div>

    </div>
    
  </div>
</template>

<script>
import { supabase } from '@/supabase';
import OrderTile from '../components/OrderTile.vue'
import UserTile from '../components/UserTile.vue'
import CompanyTile from '@/shared/components/CompanyTile.vue'

export default {
  name: 'UserDetailView',
  components: {
    OrderTile,
    UserTile,
    CompanyTile,
  },
  data() {
    return {
      drivers: [],
      user: [],
      loading: true,
      alertTitle: '',
      alertInfo: '',
      successAlertTitle: 'Erfolgreich',
      successAlertInfo: 'Aktion wurde erfolgreich durchgeführt',
      failureAlertTitle: 'Fehler',
      failureAlertInfo: 'Es ist ein Fehler aufgetreten!',
    };
  },
  async mounted() {
    const user_id = this.$route.params.userid

    try {

      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', user_id)

      if(error) throw error;

      this.user = data[0]

      {
        const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('buyer', user_id)

        if(error) throw error;

        if(data.length > 0) {
          this.user.orders = data
        }
      }

      {
        const { data, error } = await supabase
        .from('companies')
        .select()
        .or('user_uid.eq.'+user_id+',employees.cs.{"'+this.user.email+'"}')
        

        if(error) throw error;

        if(data.length > 0) {
          this.user.company = data[0]

          if(data[0].user_uid == this.user.id) this.user.isCompanyLeader = true
        }
      }

      {
        const { data, error } = await supabase
          .from('user_roles')
          .select()

        if(error) throw error

        this.drivers = data
      }

      console.log(this.user)
      this.loading = false

    } catch(e) {
      console.log(e)
    }
  },
  methods: {
    mailSelected() {
      location.href = "mailto:" + this.user.email 
    }
  }
};
</script>

<style scoped>

.row {
  margin: 0 0;
}

.mail {
  position: relative;
  top: 19px;
  width: 95%;
  margin: -20px 10px 40px 10px;
}

.fa-envelope {
  margin-right: 5px;
}

.orders {
  padding: 10px 0;
}

</style>
