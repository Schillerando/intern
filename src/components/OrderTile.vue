<template>
  <router-link :is="completeData == undefined ? 'router-link' : 'div'" :to="link">
    <div v-if="!loading" class="card" :class="{ 'no_hover': completeData != undefined }">
      <h3 v-if="completeData != undefined">Bestellübersicht</h3>

      <div>
        <div class="date" >
          <i class="fa-solid fa-calendar"></i>
          <span>{{ this.order.day }}</span>
        </div>

        <div class="order_info" >

          <div class="order_time">
            <i class="fa-solid fa-clock"></i>
            <span>{{ this.order.order_time }}</span>
          </div>

          <div class="buyer_name">
            <i class="fa-solid fa-user"></i>
            <span>{{ this.order.buyer_name }}</span>
          </div>
        </div>

        <div class="delivery_info">

          <div  :class="{ green: this.order.duration <= 15, red: this.order.duration > 15 }" class="delivery_time">
            <i class="fa-solid fa-truck"></i>
            <span v-if="this.order.delivery_time != null && this.order.delivery_time != ''">{{ this.order.delivery_time }}</span>
            <span v-else-if="this.order.driver != null && selectedDriver == null" class="badge text-bg-warning" >In Bearbeitung</span>
            <span v-else class="badge text-bg-danger" >Bote zuweisen</span>
          </div>

          <div class="driver_name">

            <div @click.prevent="" v-if="this.order.driver == null || (this.order.driver != null && this.selectedDriver != null)" class="input-group input-group-sm">
              <span class="input-group-text">
                <i class="fa-regular fa-id-card"></i>
              </span>
              <select 
              class="form-select"
              id="order-driver"
              aria-label="Default select example"
              :value="order.driver"
              @change="selectDriver"
              >
                <option :value="null" selected>Lieferbote</option>
                <option v-for="driver in this.drivers" :key="driver.id" :value="driver.id">{{ driver.name }}</option>
              </select>
            </div>

            <div v-else >
              <i class="fa-regular fa-id-card id_card"></i>
              <span>{{ this.order.driver_name }}</span>
            </div>
            
          </div>
        </div>
      </div>
      
      <div class="deliver_to" >
        <i class="fa-solid fa-location-dot"></i>
        <span>{{ this.order.deliver_to }}</span>
      </div>

      <div class="order_details" >
        <div class="company_count">
          <i class="fa-solid fa-building"></i>
          <span>{{ this.order.company_count }}</span>
        </div>

        <div class="product_count">
          <i class="fa-solid fa-box-open"></i>
          <span>{{ this.order.product_count }}</span>
        </div>

        <span class="order_price">{{ this.order.order_price }} $</span>

        <button @click.prevent="confirmOrder" v-if="this.order.driver == null || (this.order.driver != null && this.selectedDriver != null)" :disabled="selectedDriver == null" class="btn btn-primary btn-sm">
          Bestätigen
        </button>

        <div class="finished">
          <i v-if="this.order.delivered" class="fa-solid fa-truck fa-xl green"></i>
          <i v-if="this.order.payed" class="fa-solid fa-credit-card fa-xl green"></i>
        </div>
      </div>
      

    </div>
  </router-link>
</template>

<script>
import { reactive } from 'vue';
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime, calculateDuration } from '../helpers.js'

export default {
  name: 'OrderTile',
  props: ['data', 'drivers', 'completeData'],
  emits: ['stopEditingOrder'],
  data() {
    return {
      loading: true,
      selectedDriver: null
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

    if(this.completeData != null && this.completeData != undefined) {
      this.order = this.completeData

      var now = new Date()
      if(this.order.delivery_time != null && this.order.delivery_time != '') this.order.duration = calculateDuration(this.order.order_time, this.order.delivery_time)
      else if(now.getDate() != this.order.day.split('.')[0]) this.order.duration = 10000
      else {
        var currentTime = `${now.getHours()}:${now.getMinutes()}`
        this.order.duration = calculateDuration(this.order.order_time, currentTime)

        this.timer = setInterval(() => {
          this.order.duration++;
        }, 60000)
      }

      this.loading = false
      return
    }

    this.order.id = this.data.id
    this.order.buyer = this.data.buyer
    this.order.buyer_name = this.data.buyer_name
    this.order.deliver_to = this.data.deliver_to
    this.order.order_price = this.data.order_price
    this.order.note = this.data.note
    this.order.payed = this.data.payed
    this.order.driver = this.data.driver
    this.order.delivered = this.data.delivered
    this.order.day = reformatDate(this.data.day)
    this.order.order_time = cutSecondsFromTime(this.data.order_time)
    this.order.delivery_time = cutSecondsFromTime(this.data.delivery_time)
    this.order.products = this.data.products
    this.order.product_count = this.order.products.length

    now = new Date()
    if(this.order.delivery_time != null && this.order.delivery_time != '') this.order.duration = calculateDuration(this.order.order_time, this.order.delivery_time)
    else if(now.getDate() != this.order.day.split('.')[0]) this.order.duration = 10000
    else {
      currentTime = `${now.getHours()}:${now.getMinutes()}`
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
  computed: {
    link() {
      if(this.data == undefined) return ''
      return `/orders/${this.data.id}`;
    },
  },
  methods: {
    selectDriver() {
      var driverInput = document.getElementById('order-driver')

      this.selectedDriver = driverInput.value
      this.order.driver = this.selectedDriver
    },
   async confirmOrder() {
      if(this.selectedDriver == null) return

      try {

        console.log(this.drivers)
        this.order.driver_name = this.drivers[this.drivers.findIndex(driver => (driver.id == this.selectedDriver))].name

        const { error } = await supabase
          .from('orders')
          .update({ driver: this.selectedDriver })
          .eq('id', this.order.id)

        if(error != null) throw error;

        this.orde
        this.selectedDriver = null 

      } catch(e) {
        console.log(e)
      }
    }
  }
};
</script>

<style scoped>
.card {
  overflow: hidden;
  margin: 0 5%;
  text-align: left;
  padding: 10px;
}

.card:hover {
  color: #0d6efd;
}

.no_hover:hover {
  color: black;
}

.fa-solid {
  margin-right: 10px;
  margin-bottom: 10px;
}

.id_card {
  margin-right: 10px;
  margin-bottom: 10px;
}

.delivery_info {
  float: right;
}

.order_info {
  float: left;
}

.company_count {
  display: inline;
  margin-right: 20px;
}

.product_count {
  display: inline;
  margin-right: 20px;
}

.order_details {
  margin-top: 20px;
  margin-bottom: -10px;
}

.deliver_to {
  margin-top: 20px;
}

.buyer_name {
  margin-bottom: 10px;
}

.green {
  color: green;
}

.red {
  color: red;
}

.finished {
  float: right;
  position: relative;
  bottom: 5px;
}

.fa-credit-card {
  margin-left: 5px;
}

.badge {
  position: relative;
  bottom: 3px;
}

.btn-primary {
  background-color: #00a100;
  border-color: #00a100;
  position: absolute;
  bottom: 5px;
  right: 10px;
}

.btn-primary:hover {
  background-color: #007400;
  border-color: #007400;
}

/*   border-radius: 0.375rem 0 0 0.375rem; */
</style>
