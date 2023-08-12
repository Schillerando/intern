<template>
<h3>Order</h3>
<p v-if="loading == false">{{ order }}</p>
</template>

<script>
import { reactive } from 'vue';
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime, calculateDuration } from '../helpers.js'

export default {
  name: 'OrderDetailView',
  data() {
    return {
      drivers: [],
      loading: false,
      alertTitle: '',
      alertInfo: '',
      successAlertTitle: 'Erfolgreich',
      successAlertInfo: 'Aktion wurde erfolgreich durchgeführt',
      failureAlertTitle: 'Fehler',
      failureAlertInfo: 'Es ist ein Fehler aufgetreten!',
    };
  },
  setup() {
    const store = useStore();

    const order = reactive({
      id: null,
      buyer: null,
      buyer_name: '',
      deliver_to: '',
      products: [],
      product_count: 0,
      company_count: 0,
      order_price: 0,
      duration: 0,
      note: '',
      payed: false,
      driver: null,
      driver_name: '',
      delivered: false,
      day: '',
      order_time: '',
      delivery_time: ''
    })

    return {
      store,
      order
    };
  },
  async mounted() {
    const orderId = this.$route.params.orderid

    try {
      
      const { data, error } = await supabase
        .from('orders')
        .select()
        .eq('id', orderId)

      if(error) throw error

      this.order.id = data[0].id
      this.order.buyer = data[0].buyer
      this.order.buyer_name = data[0].buyer_name
      this.order.deliver_to = data[0].deliver_to
      this.order.order_price = data[0].order_price
      this.order.note = data[0].note
      this.order.payed = data[0].payed
      this.order.driver = data[0].driver
      this.order.delivered = data[0].delivered
      this.order.day = reformatDate(data[0].day)
      this.order.order_time = cutSecondsFromTime(data[0].order_time)
      this.order.delivery_time = cutSecondsFromTime(data[0].delivery_time)
      this.order.products = data[0].products
      this.order.product_count = this.order.products.length
    } catch(e) {
      console.log(e)
      return
    }

    if(this.order.delivery_time != null && this.order.delivery_time != '') this.order.duration = calculateDuration(this.order.order_time, this.order.delivery_time)
    else {
      var now = new Date()
      var currentTime = `${now.getHours()}:${now.getMinutes()}`
      this.order.duration = calculateDuration(this.order.order_time, currentTime)

      this.timer = setInterval(() => {
        this.order.duration++;
      }, 60000)
    }

    if(this.order.driver != null) {
      var index = this.drivers.findIndex(driver => driver.id == this.order.driver)

      this.order.driver_name =  this.drivers[index].name
    }

    const productIds = []
    this.order.products.forEach((productId) => {      
      if(!productIds.includes(productId)) productIds.push(productId)
    })

    try {

      const companyIds = []

      {
        const { data, error } = await supabase
          .from('products')
          .select('company_id')
          .in('id', productIds)

        if(error != null) throw error

        data.forEach(company => {
          if(!companyIds.includes(company.company_id)) companyIds.push(company.company_id)
        })

      }

      this.order.company_count = companyIds.length

    } catch(e) {
      console.log(e)
    }

    this.loading = false
  },
};
</script>

<style scoped>
</style>
