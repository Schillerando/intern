<template>
  <div v-if="this.service != null" class="row">
    <div class="col-lg-6 col-xl-4">
      <div class="overview">
        <ServiceTile :drivers="drivers" :complete-data="service"></ServiceTile>
        <div class="company_tile">
          <CompanyTile :data="service.companies" />
        </div>
      </div>
    </div>

    <div class="col-lg-6 col-xl-4">
      <div class="details">
        <h5>Zu zahlen: {{ this.service.price }} $</h5> 

        <div class="input-group mb-1">
          <span span class="input-group-text"
            ><i class="fa fa-user"></i
          ></span>
          <input
            type="text"
            id="user-name"
            class="form-control"
            placeholder="Name"
            :value="this.service.buyer_name"
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
            :value="this.service.buyer_email"
            disabled
          />
        </div>

        <div class="input-group mb-3">
          <span class="input-group-text"
            ><i class="fa-solid fa-location-dot"></i
          ></span>
          <textarea
            type="text"
            id="service-location"
            class="form-control"
            placeholder="Genaue Beschreibung des Lieferortes"
            maxlength="200"
            style="resize: none"
            rows="3"
            cols="50"
            :value="this.service.companies.location"
            disabled
          ></textarea>
        </div>

        <div v-if="this.service.note != ''" class="input-group mb-4">
          <span class="input-group-text"
            ><i class="fa-solid fa-circle-info"></i></span>
          <textarea
            type="text"
            id="service-note"
            class="form-control"
            placeholder="Anmerkungen zum Service"
            required
            maxlength="300"
            style="resize: none"
            rows="6"
            cols="50"
            :value="this.service.note"
            disabled
          ></textarea>
        </div>

      </div>

    </div>

    <div class="col-lg-6 col-xl-4">
      <div class="finished" v-if="this.service.finished">

        <h5>Service Abgeschlossen</h5>

        <div class="input-group mb-4">
          <span class="input-group-text"
            ><i class="fa-solid fa-circle-info"></i></span>
          <textarea
            type="text"
            id="service-review"
            class="form-control"
            placeholder="Anmerkungen? Probleme? Feedback?"
            required
            maxlength="300"
            style="resize: none"
            rows="6"
            cols="50"
            disabled
            :value="this.service.review"
          ></textarea>
        </div>

      </div>
    </div>
    
  </div>
</template>

<script>
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime, calculateDuration } from '../helpers.js'
import ServiceTile from '../components/ServiceTile.vue'
import CompanyTile from '../components/CompanyTile.vue'

export default {
  name: 'ServiceDetailView',
  components: {
    ServiceTile,
    CompanyTile,
  },
  data() {
    return {
      drivers: [],
      service: null,
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

    return {
      store,
    };
  },
  computed: {
    serviceData() {
      var services = this.store.state.services

      var index = services.findIndex((service) => service.id == this.$route.params.serviceid)

      console.log(this.$route.params.serviceid)

      var service = services[index]

      return service
    }
  },
  async mounted() {
    this.service = this.serviceData

    this.service.date = reformatDate(this.serviceData.date)
    this.service.booked_time = cutSecondsFromTime(this.serviceData.booked_time)
    this.service.contact_time = cutSecondsFromTime(this.serviceData.contact_time)
    this.service.finished_time = cutSecondsFromTime(this.serviceData.finished_time)

    try {
      
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', this.serviceData.buyer)

      if(error) throw error

      this.service.buyer_email = data[0].email

    } catch(e) {
      console.log(e)
      return
    }

    if(this.service.contact_time != null && this.service.contact_time != '') this.service.duration = calculateDuration(this.service.booked_time, this.service.contact_time)
    else {
      var now = new Date()
      var currentTime = `${now.getHours()}:${now.getMinutes()}`
      this.service.duration = calculateDuration(this.service.booked_time, currentTime)

      this.timer = setInterval(() => {
        this.service.duration++;
      }, 60000)
    }

    {
      const { data, error } = await supabase
        .from('user_roles')
        .select()

      if(error) throw error

      this.drivers = data
    }

    if(this.service.driver != null) {
      var index = this.drivers.findIndex(driver => driver.id == this.service.driver)

      this.service.driver_name =  this.drivers[index].name
    }

  },
  watch: {
    serviceData() {
      this.updateService()
    }
  },
  methods: {
    updateService() {
      if(this.serviceData == undefined) return

      this.service.payed = this.serviceData.payed
      this.service.finished = this.serviceData.delivered
      this.service.driver = this.serviceData.driver

      if(this.drivers.length > 0 && this.service.driver != null) {
        var index = this.drivers.findIndex(driver => driver.id == this.service.driver)

        this.service.driver_name =  this.drivers[index].name
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

.company_tile {
  margin: 15px;
}

</style>
