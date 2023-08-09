<template>
  <TitleDiv title="Bestellungen"></TitleDiv>
</template>

<script>
import { supabase } from '@/supabase';
import TitleDiv from '@/components/TitleDiv.vue';

export default {
  name: 'OrderView',
  components: {
    TitleDiv
  },
  data() {
    return {
      newOrders: [],
      oldOrders: []
    };
  },
  async mounted() {
    if (this.$route.params.companyalias) {
      const { data, error } = await supabase
        .from('orders')
        .select()
        .order('day', { ascending: false })
        .order('order_time', { ascending: false })

      if (error != null) console.log(error);
      if (data === null || data.length === 0) return;

      data.forEch(order => {
        if(order.delivered && order.payed) this.oldOrders.push(order)
        else this.newOrders.push(order)
      })
    }
  }
};
</script>
