<template>
  <TitleDiv title="Bestellungen"></TitleDiv>

  <div v-if="drivers.length > 0 && this.newOrders.length > 0">
    <h3>Neue Bestellungen</h3>
    <div v-for="order in this.newOrders" :key="order.id">
      <OrderTile :data="order" :drivers="drivers"></OrderTile>
    </div>
  </div>

  <div v-if="drivers.length > 0 && this.oldOrders.length > 0">
    <h3>Alte Bestellungen</h3>
    <div v-for="order in this.oldOrders" :key="order.id">
      <OrderTile :data="order" :drivers="drivers"></OrderTile>
    </div>
  </div>
  
</template>

<script>
import TitleDiv from '@/components/TitleDiv.vue';
import OrderTile from '@/components/OrderTile.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { supabase } from '@/supabase';

export default {
  name: 'OrderView',
  components: {
    TitleDiv,
    OrderTile
  },
  setup() {
    const store = useStore();

    const newOrders = computed(() => {
      var orders = store.state.orders
      orders = orders.filter(order => (order.delivered == false || order.payed == false))
      orders.sort((a, b) => (a.day + a.order_time).localeCompare((b.day + b.order_time)))
      return orders
    })

    const oldOrders = computed(() => {
      var orders = store.state.orders
      orders = orders.filter(order => (order.delivered == true && order.payed == true))
      orders.sort((a, b) => (a.day + a.order_time).localeCompare((b.day + b.order_time)))
      return orders
    })

    console.log(store.state.orders)

    return {
      store,
      newOrders,
      oldOrders
    }
  },
  data() {
    return {
      drivers: []
    };
  },
  async mounted() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select()

      if(error != null) throw error

      this.drivers = data
    } catch(e) {
      console.log(e)
    }
  }
};
</script>

<style scoped>
  h3 {
    margin-bottom: 20px;
  }

  div {
    margin-bottom: 40px;
  }
</style>