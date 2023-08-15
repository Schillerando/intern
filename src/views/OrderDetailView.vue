<template>
  <div class="row">
    <div class="col-lg-6">
      <div class="overview">
        <OrderTile :drivers="drivers" :complete-data="order"></OrderTile>
      </div>
    </div>

    <div class="col-lg-6">
      <div v-if="this.loading == false" class="companies">
        <div class="accordion" id="companyAccordion">
          <div v-for="stack in this.order.stacked_company_products" :key="stack.company.id" class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + stack.company.alias" aria-expanded="true" :aria-controls="stack.company.alias">
                {{ stack.company.name }}
              </button>
            </h2>
            <div :id="stack.company.alias" class="accordion-collapse collapse" data-bs-parent="#companyAccordion">
              <div class="accordion-body">
                <CompanyTile :data="stack.company"></CompanyTile>

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

    </div>

    <div class="col-lg-6">
      <div class="details">
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

        {{  this.order.to_pay }}
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

export default {
  name: 'OrderDetailView',
  components: {
    OrderTile,
    CompanyTile,
    ShoppingCartTile
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
    this.order.payed = this.orderData.payed
    this.order.driver = this.orderData.driver
    this.order.delivered = this.orderData.delivered
    this.order.day = reformatDate(this.orderData.day)
    this.order.order_time = cutSecondsFromTime(this.orderData.order_time)
    this.order.delivery_time = cutSecondsFromTime(this.orderData.delivery_time)
    this.order.products = this.orderData.products
    this.order.product_count = this.order.products.length

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

    const stackedProductIds = []
    this.order.products.forEach((productId) => { 
      var index = stackedProductIds.findIndex(product => product.id == productId)
      
      if(index == -1) stackedProductIds.push({ id: productId, count: 1 })
      else stackedProductIds[index].count++
    })

    var count = 0
    try {
      stackedProductIds.forEach(async (p) => {
        const { data, error } = await supabase
          .from('products')
          .select()
          .eq('id', p.id)

        if(error != null) throw error

        var product = data[0]
        product.count = p.count

        var index = this.order.stacked_company_products.findIndex(stack => stack.company.id == product.company_id)
        if(index == -1) {
          this.order.company_count++

          this.order.stacked_company_products.push({
            company: {
              id: product.company_id
            },
            products: [product],
            amount: product.price * product.count,
            fee: 0
          })

          const { data, error } = await supabase
            .from('companies')
            .select()
            .eq('id', product.company_id)

          if(error) throw error

          var newIndex = this.order.stacked_company_products.findIndex(stack => stack.company.id == product.company_id)
          this.order.stacked_company_products[newIndex].company = data[0]
          if(data[0].abo == 'Standard') {
            this.order.stacked_company_products[newIndex].fee = (product.price * product.count) * 0.05

            this.order.to_pay += (product.price * product.count) * 0.95
          } else {
            this.order.to_pay += (product.price * product.count)
          }

          count += product.count
        } else {
          this.order.stacked_company_products[index].products.push(product)
          this.order.stacked_company_products[index].amount += product.price * product.count

          if(this.order.stacked_company_products[index].company.abo == 'Standard') {
            this.order.stacked_company_products[newIndex].fee += (product.price * product.count) * 0.05

            this.order.to_pay += (product.price * product.count) * 0.95
          } else {
            this.order.to_pay += (product.price * product.count)
          }
          
          count += product.count
        }

        if(count == this.order.product_count) this.loading = false
      })

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

</style>
