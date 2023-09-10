<template>

  <div v-if="order != null && !loading">

  </div>  

  <h4 v-else-if="!loading">{{ error }}</h4>
  
</template>

<script>
import { supabase } from '@/supabase';

export default {
  name: 'OrderConfirmView',
  setup() {

  },
  data() {
    return {
      order: null,
      loading: true,
      error: 'Fehler'
    };
  },
  async mounted() {

    try {
      
      const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('id', this.$route.params.orderid)

      if(error) throw error;

      if(data.length == 0) this.error = 'Lieferung nicht gefunden'

      this.order = data[0]

      if(this.$route.params.user_id != this.order.buyer) {
        this.error = 'Nutzerdaten falsch'
        this.order = null;
      }

    } catch(e) {
      console.log(e)
    }

    this.loading = false;
  }
};
</script>

<style scoped>

</style>
