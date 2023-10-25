<template>
  <div class="row">
    <div class="col-lg-6 col-xl-4">
      <div class="overview">
        <OrderTile :drivers="drivers" :complete-data="order"></OrderTile>
      </div>
    </div>

    <div class="col-lg-6 col-xl-4">
      <div class="details">
        <h5>Zu zahlen: {{ this.order.order_price }} $</h5> 

        <div class="input-group mb-1">
          <span span class="input-group-text"
            ><i class="fa fa-user"></i
          ></span>
          <input
            type="text"
            id="user-name"
            class="form-control"
            placeholder="Name"
            :value="this.order.buyer_name"
            disabled
          />

        </div>
        <div class="input-group mb-3">
          <span class="input-group-text"
            ><i class="fa fa-envelope"></i
          ></span>
          <input
            type="email"
            id="account-mail"
            class="form-control"
            data-regex="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            placeholder="Email"
            :value="this.order.buyer_email"
            disabled
          />
        </div>

        <div class="input-group mb-3">
          <span class="input-group-text"
            ><i class="fa-solid fa-location-dot"></i
          ></span>
          <textarea
            type="text"
            id="order-location"
            class="form-control"
            placeholder="Genaue Beschreibung des Lieferortes"
            maxlength="200"
            style="resize: none"
            rows="3"
            cols="50"
            :value="this.order.deliver_to"
            disabled
          ></textarea>
        </div>

        <div v-if="this.order.note != ''" class="input-group mb-4">
          <span class="input-group-text"
            ><i class="fa-solid fa-circle-info"></i></span>
          <textarea
            type="text"
            id="order-note"
            class="form-control"
            placeholder="Anmerkungen zur Lieferung (Sonderwünsche etc.)"
            required
            maxlength="300"
            style="resize: none"
            rows="6"
            cols="50"
            :value="this.order.note"
            disabled
          ></textarea>
        </div>

      </div>

    </div>

    <div class="col-lg-6 col-xl-4">
      <div v-if="this.loading == false" class="companies">
        <h5>Kosten: {{ this.order.to_pay }} $</h5> 

        <div class="accordion" id="companyAccordion">
          <div v-for="stack in this.order.stacked_company_products" :key="stack.company.id" class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#t' + stack.company.id" aria-expanded="true" :aria-controls="stack.company.alias">
                {{ stack.company.name }}
              </button>
            </h2>
            <div :id="'t' + stack.company.id" class="accordion-collapse collapse" data-bs-parent="#companyAccordion">
              <div class="accordion-body">
                <CompanyTile :data="stack.company" :noLink="false"></CompanyTile>

                <div v-for="product in stack.products" :key="product.id">
                  <ShoppingCartTile :data="product"></ShoppingCartTile>
                </div>

                <div class="company-amount">
                    <span :class="{ green: stack.fee == 0 }">{{ stack.amount + " $" }}</span>
                    <span style="color: red;" v-if="stack.fee > 0">{{" - " + stack.fee + " $"}} </span>
                    <span v-if="stack.fee > 0"> = </span>
                    <span style="color: green;" v-if="stack.fee > 0">{{ (stack.amount-stack.fee) + " $" }}</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="finished" v-if="this.order.delivered">

        <h5>Lieferung Abgeschlossen</h5>

        <div class="input-group mb-4">
          <span class="input-group-text"
            ><i class="fa-solid fa-circle-info"></i></span>
          <textarea
            type="text"
            id="order-review"
            class="form-control"
            placeholder="Anmerkungen? Probleme? Feedback?"
            required
            maxlength="300"
            style="resize: none"
            rows="6"
            cols="50"
            disabled
            :value="this.order.review"
          ></textarea>
        </div>

      </div>
    </div>

    <div class="col-lg-6 col-xl-4">
      <div v-if="this.loading == false" class="mapWrapper">
        
        <MapProvider :companies="order.companies" class="map" />

      </div>
    </div>
    
  </div>
</template>

<script>
import { reactive } from 'vue';
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime, calculateDuration } from '../helpers.js'
import OrderTile from '../components/OrderTile.vue'
import CompanyTile from '../components/CompanyTile.vue'
import ShoppingCartTile from '../components/ShoppingCartTile.vue'
import MapProvider from '../components/MapProvider.vue'

export default {
  name: 'OrderDetailView',
  components: {
    OrderTile,
    CompanyTile,
    ShoppingCartTile,
    MapProvider
  },
  data() {
    return {
      drivers: [],
      loading: true,
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
      buyer_email: '',
      deliver_to: '',
      products: [],
      stacked_company_products: [],
      product_count: 0,
      company_count: 0,
      companies: [],
      order_price: 0,
      to_pay: 0,
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
  computed: {
    orderData() {
      var orders = this.store.state.orders

      var index = orders.findIndex((order) => order.id == this.$route.params.orderid)

      var order = orders[index]

      return order
    }
  },
  async mounted() {
    this.order.id = this.orderData.id
    this.order.buyer = this.orderData.buyer
    this.order.buyer_name = this.orderData.buyer_name
    this.order.deliver_to = this.orderData.deliver_to
    this.order.order_price = this.orderData.order_price
    this.order.note = this.orderData.note
    this.order.review = this.orderData.review
    this.order.payed = this.orderData.payed
    this.order.driver = this.orderData.driver
    this.order.delivered = this.orderData.delivered
    this.order.day = reformatDate(this.orderData.day)
    this.order.order_time = cutSecondsFromTime(this.orderData.order_time)
    this.order.delivery_time = cutSecondsFromTime(this.orderData.delivery_time)
    this.order.order_products = this.orderData.order_products
    this.order.product_count = 0

    if(this.orderData.order_products != undefined) {
      this.orderData.order_products.forEach((p) => {
        this.order.product_count += p.count;
      });
    }
    

    try {
      
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', this.orderData.buyer)

      if(error) throw error

      this.order.buyer_email = data[0].email

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

    {
      const { data, error } = await supabase
        .from('user_roles')
        .select()

      if(error) throw error

      this.drivers = data
    }

    if(this.order.driver != null) {
      var index = this.drivers.findIndex(driver => driver.id == this.order.driver)

      this.order.driver_name =  this.drivers[index].name
    }

    console.log(this.order)

    var count = 0
    var productIds = []
    var variationIds = []
    var extraIds = []

    try {
      if(this.order.order_products != undefined) {
        this.order.order_products.forEach(async (p) => {
          if(!productIds.includes(p.product)) productIds.push(p.product)
          if(p.variation != null && !variationIds.includes(p.variation)) variationIds.push(p.variation)

          if(p.extras != null && p.extras != undefined)
            p.extras.forEach(extra => {
              if(!extraIds.includes(extra)) extraIds.push(extra)
            })
        })
      }
      

      var fullProducts = []
      var variations = []
      var extras = []

      const { data, error } = await supabase
        .from('products')
        .select('*, companies(*)')
        .filter('id', 'in', '(' + productIds + ')')

      if(error) throw error

      fullProducts = data

      {
        const { data, error } = await supabase
          .from('product_variations')
          .select()
          .filter('id', 'in', '(' + variationIds + ')')

        if(error) throw error

        variations = data
      }
      
      {
        const { data, error } = await supabase
          .from('product_extras')
          .select()
          .filter('id', 'in', '(' + extraIds + ')')

        if(error) throw error

        extras = data
      }

      for(var i = 0; i < fullProducts.length; i++) {
        fullProducts[i].variations = variations
        fullProducts[i].extras = extras
      }

      /*
      productIds.forEach(async (p) => {
        const { data, error } = await supabase
          .from('products')
          .select()
          .eq('id', p)

        if(error != null) throw error

        var product = data[0]

        if(product.has_variations) {
          const { data, error } = await supabase
            .from('product_variations')
            .select()
            .eq('product', p)

          if(error != null) throw error

          product.variations = data
        }

        if(product.has_extras) {
          const { data, error } = await supabase
            .from('product_extras')
            .select()
            .eq('product', p)

          if(error != null) throw error

          product.extras = data
        }

        fullProducts.push(product)
      })

      */

      if(this.order.order_products != undefined) {
        this.order.order_products.forEach((orderProduct) => {
        var fullProduct = fullProducts.find(p => p.id == orderProduct.product)

        fullProduct.count = orderProduct.count
        fullProduct.variation = orderProduct.variation
        fullProduct.picked_extras = orderProduct.extras
        fullProduct.price = orderProduct.price

        var index = this.order.stacked_company_products.findIndex(stack => stack.company.id == fullProduct.company_id)
        if(index == -1) {
          this.order.company_count++

          var company = fullProduct.companies

          this.order.stacked_company_products.push({
            company: company,
            products: [fullProduct],
            amount: fullProduct.price * fullProduct.count,
            fee: 0
          })

          var newIndex = this.order.stacked_company_products.findIndex(stack => stack.company.id == fullProduct.company_id)
          this.order.companies.push(company)
          if(company.abo == 'Standard') {
            this.order.stacked_company_products[newIndex].fee = Math.round((fullProduct.price * fullProduct.count) * 0.05)

            this.order.to_pay += (fullProduct.price * fullProduct.count) - this.order.stacked_company_products[newIndex].fee
          } else {
            this.order.to_pay += (fullProduct.price * fullProduct.count)
          }

          count += fullProduct.count
        } else {
          this.order.stacked_company_products[index].products.push(fullProduct)
          this.order.stacked_company_products[index].amount += fullProduct.price * fullProduct.count

          if(this.order.stacked_company_products[index].company.abo == 'Standard') {
            this.order.stacked_company_products[index].fee += Math.round((fullProduct.price * fullProduct.count) * 0.05)

            this.order.to_pay += (fullProduct.price * fullProduct.count) * 0.95 - this.order.stacked_company_products[index].fee
          } else {
            this.order.to_pay += (fullProduct.price * fullProduct.count)
          }
          
          count += fullProduct.count
        }

      })
      }
      

      this.loading = false
      console.log(count)

      console.log(this.order.stacked_company_products)

    } catch(e) {
      console.log(e)
    }
  },
  watch: {
    orderData() {
      this.updateOrder()
    }
  },
  methods: {
    updateOrder() {
      if(this.orderData == undefined) return

      this.order.payed = this.orderData.payed
      this.order.delivered = this.orderData.delivered
      this.order.driver = this.orderData.driver

      if(this.drivers.length > 0 && this.order.driver != null) {
        var index = this.drivers.findIndex(driver => driver.id == this.order.driver)

        this.order.driver_name =  this.drivers[index].name
      } 
    }
  }
};
</script>

<style scoped>

.overview {
  margin: 40px -5% 0 -5%;
}

.companies {
  margin-top: 40px;
  margin-bottom: 50px;
}

.accordion-body {
  padding: 10px 0;
}

.company-amount {
  margin-top: 20px;
  font-size: 1.25rem;
}

.green {
  color: green;
}

.row {
  margin: 0 5%;
  padding: 0;
}

.details {
  margin-top: 40px;
}

.input-group-text {
  width: 40px;
}

input:disabled {
  background-color: white;
}

textarea:disabled {
  background-color: white;
}

h5 {
  text-align: left;
  margin-bottom: 20px;
}

.finished {
  margin-bottom: 100px;
}

.mapWrapper {
  position: relative;
  width: calc(100% - 20px);
  padding-bottom: calc(100% - 20px);
  margin: 0 10px 100px 10px;
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  left: 0;
  border-style: groove;
  border-color: #ebebeb;
  border-width: 1px;
}

</style>
