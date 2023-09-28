<template>
  <router-link :is="completeData == undefined ? 'router-link' : 'div'" :to="link">
    <div v-if="!loading" class="card" :class="{ 'no_hover': completeData != undefined }">
      <h3 v-if="completeData != undefined">{{ service.type }}</h3>

      <div>
        <div class="order_info" >
          <div class="date" >
            <i class="fa-solid fa-calendar"></i>
            <span>{{ this.service.date }}</span>
          </div>

          <div class="order_time">
            <i class="fa-solid fa-clock"></i>
            <span>{{ this.service.booked_time }}</span>
          </div>

          <div class="buyer_name">
            <CompanyBadge class="company_badge" :premium="this.service.companies.abo == 'Business'" :verified="true"/>
            <span class="company_name">{{ this.service.companies.name }}</span>
          </div>
        </div>

        <div class="delivery_info">

          <div :class="{ green: this.service.duration <= 15, red: this.service.duration > 15 }" class="delivery_time">
            <i class="fa-solid fa-people-arrows"></i>
            <span v-if="this.service.contact_time != null && this.service.contact_time != ''">{{ this.service.contact_time }}</span>
            <span v-else-if="this.service.driver != null && selectedDriver == null && this.service.contact_time == null" class="badge text-bg-warning" >In Bearbeitung</span>
            <span v-else-if="this.service.driver == null" class="badge text-bg-danger" >Bote zuweisen</span>
          </div>

          <div v-if="this.service.contact_time != null && this.service.contact_time != ''" class="delivery_time">
            <i class="fa-solid fa-truck"></i>
            <span v-if="this.service.finished_time != null && this.service.finished_time != ''">{{ this.service.finished_time }}</span>
            <span v-else-if="this.service.driver != null && selectedDriver == null" class="badge text-bg-warning" >Wird ausgeführt</span>
          </div>

          <div class="driver_name">

            <div @click.prevent="" v-if="this.service.driver == null || (this.service.driver != null && this.selectedDriver != null)" class="input-group input-group-sm">
              <span class="input-group-text">
                <i class="fa-regular fa-id-card"></i>
              </span>
              <select 
              class="form-select"
              id="service-driver"
              aria-label="Default select example"
              :value="service.driver"
              @change="selectDriver"
              >
                <option :value="null" selected>Lieferbote</option>
                <option v-for="driver in this.drivers" :key="driver.id" :value="driver.id">{{ driver.name }}</option>
              </select>
            </div>

            <div v-else >
              <i class="fa-regular fa-id-card id_card"></i>
              <span>{{ this.service.driver_name }}</span>
            </div>
            
          </div>
        </div>
      </div>
      
      <div class="deliver_to" >
        <i class="fa-solid fa-location-dot"></i>
        <span>{{ this.service.companies.location }}</span>
      </div>

      <div class="order_details" >
        <span class="order_price">{{ this.service.price }} $</span>

        <button @click.prevent="confirmService" v-if="this.service.driver == null || (this.service.driver != null && this.selectedDriver != null)" :disabled="selectedDriver == null" class="btn btn-primary btn-sm">
          Bestätigen
        </button>

        <div class="finished">
          <i v-if="this.service.finished" class="fa-solid fa-truck fa-xl green"></i>
          <i v-if="this.service.payed" class="fa-solid fa-credit-card fa-xl green"></i>
        </div>
      </div>
      

    </div>
  </router-link>
</template>

<script>
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime, calculateDuration } from '../helpers.js'
import CompanyBadge from '@/shared/components/CompanyBadge.vue';

export default {
  name: 'ServiceTile',
  props: ['data', 'drivers', 'completeData'],
  emits: ['stopEditingService'],
  components: {
    CompanyBadge
  },
  data() {
    return {
      loading: true,
      selectedDriver: null,
      service: null
    };
  },
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
  async mounted() {

    if(this.completeData != null && this.completeData != undefined) {
      this.service = this.completeData

      var now = new Date()
      if(this.service.contact_time != null && this.service.contact_time != '') this.service.duration = calculateDuration(this.service.booked_time, this.service.contact_time)
      else if(now.getDate() != this.service.date.split('.')[0]) this.service.duration = 10000
      else {
        var currentTime = `${now.getHours()}:${now.getMinutes()}`
        this.service.duration = calculateDuration(this.service.booked_time, currentTime)

        this.timer = setInterval(() => {
          this.service.duration++;
        }, 60000)
      }

      this.loading = false
      return
    }

    this.service = this.data

    this.service.date = reformatDate(this.data.date)
    this.service.booked_time = cutSecondsFromTime(this.data.booked_time)
    this.service.contact_time = cutSecondsFromTime(this.data.contact_time)
    this.service.finished_time = cutSecondsFromTime(this.data.finished_time)

    now = new Date()
    if(this.service.contact_time != null && this.service.contact_time != '') this.service.duration = calculateDuration(this.service.booked_time, this.service.contact_time)
    else if(now.getDate() != this.service.date.split('.')[0]) this.service.duration = 10000
    else {
      currentTime = `${now.getHours()}:${now.getMinutes()}`
      this.service.duration = calculateDuration(this.service.booked_time, currentTime)

      this.timer = setInterval(() => {
        this.service.duration++;
      }, 60000)
    }

    if(this.service.driver != null) {
      var index = this.drivers.findIndex(driver => driver.id == this.service.driver)

      this.service.driver_name =  this.drivers[index].name
    }

    this.loading = false
  },
  computed: {
    link() {
      if(this.data == undefined) return ''
      return `/services/${this.data.id}`;
    },
  },
  methods: {
    selectDriver() {
      var driverInput = document.getElementById('service-driver')

      this.selectedDriver = driverInput.value
      this.service.driver = this.selectedDriver
    },
   async confirmService() {
      if(this.selectedDriver == null) return

      try {

        this.service.driver_name = this.drivers[this.drivers.findIndex(driver => (driver.id == this.selectedDriver))].name

        const { error } = await supabase
          .from('booked_services')
          .update({ driver: this.selectedDriver })
          .eq('id', this.service.id)

        if(error != null) throw error;

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

#service-driver {
  max-width: 140px;
}

.company_name {
  float: right;
  position: relative;
  left: 2px;
}

.company_badge {
  display: inline;
  float: left;
  position: relative;
  right: 4px;
}

/*   border-radius: 0.375rem 0 0 0.375rem; */
</style>
