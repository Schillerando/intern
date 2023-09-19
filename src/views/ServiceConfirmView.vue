<template>

  <div v-if="service != null && !loading">
    <div class="row">
      <div class="col-lg-6">
        <div class="overview">
          <ServiceTile :data="this.service" :drivers="this.drivers" />
          <div class="company_tile">
            <CompanyTile :data="service.companies" />
          </div>
        </div>
      </div>

      <div class="col-lg-6">

        <form class="mx-3">
          <div class="form-check mt-4">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="service-check1"
              @change="validateService(false)"
            />
            <label class="form-check-label" for="acceptCheck">
              Service wurde entgegen genommen
            </label>
          </div>
          <div class="form-check mt-2 mb-4">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="service-check2"
              @change="validateService(false)"
            />
            <label class="form-check-label" for="acceptCheck">
              Kunde hat den vollen Preis des Services bezahlt
            </label>
          </div>
  
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
              :value="this.service.review"
            ></textarea>
          </div>
        </form>
        
        <button
          type="button"
          @click="validateService(true)"
          class="btn btn-primary service-button mx-3"
        >
          <div class="loading-button">Bestätigen</div>
          <div class="spinner">
            <span
              class="spinner-bservice spinner-bservice-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span class="sr-only">Loading...</span>
          </div>
        </button>
      </div>
    </div>
  </div>  

  <h4 v-else-if="!loading" class="m-4">{{ error }}</h4>
  
</template>

<script>
import { supabase } from '@/supabase';
import ServiceTile from '@/components/ServiceTile.vue';
import CompanyTile from '@/components/CompanyTile.vue';
import { useStore } from 'vuex'

export default {
  name: 'serviceConfirmView',
  components: {
    ServiceTile,
    CompanyTile
  },
  data() {
    return {
      service: null,
      drivers: null,
      loading: true,
      error: 'Fehler',
      confirmPressed: false
    };
  },
  setup() {
    const store = useStore();

    return {
      store
    }
  },
  async mounted() {

    try {
      
      const { data, error } = await supabase
        .from('booked_services')
        .select('*, companies(*)')
        .eq('id', this.$route.params.serviceid)

      if(error) throw error;

      if(data.length == 0) this.error = 'Service nicht gefunden'

      this.service = data[0]

      if(this.$route.query.user_id != this.service.buyer) {
        this.error = 'Nutzerdaten falsch'
        this.service = null;
      }
      else if(this.service.driver == null) {
        this.error = 'Service wird noch zugewiesen'
        this.service = null;
      }
      else if(this.service.payed == true && this.service.finished == true) {
        this.error = 'Service wurde schon bestätigt'
        this.service = null;
      }

      {
        const { data, error } = await supabase
          .from('user_roles')
          .select()

        if(error) throw error;

        this.drivers = data
      }

    } catch(e) {
      console.log(e)
    }

    this.loading = false;
  },
  methods: {
    validateService(pressed) {
      if(!pressed && !this.confirmPressed) return

      var valid = true;

      var checkInput1 = document.getElementById('service-check1');
      var checkInput2 = document.getElementById('service-check2');

      if (!checkInput1.checked) {
        checkInput1.classList.add('is-invalid');
        checkInput1.classList.remove('is-valid');
        valid = false;
      } else {
        checkInput1.classList.remove('is-invalid');
        checkInput1.classList.add('is-valid');
      }

      if (!checkInput2.checked) {
        checkInput2.classList.add('is-invalid');
        checkInput2.classList.remove('is-valid');
        valid = false;
      } else {
        checkInput2.classList.remove('is-invalid');
        checkInput2.classList.add('is-valid');
      }

      this.confirmPressed = true

      if(valid && pressed) {
        this.confirmPressed = false
        this.confirmService()
      }
    },
    async confirmService() {
      var reviewInput = document.getElementById('service-review');

      try {
        var today = new Date()

        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        const { error } = await supabase
          .from('booked_services')
          .update({
            payed: true,
            review: reviewInput.value,
            contact_time: time
          })
          .eq('id', this.service.id)

        if(error) throw error

        if(this.service.price != 0) {
          const { error } = await supabase
            .from('accounting')
            .insert({
              company_id: '9d1f8296-4360-4ca8-b19e-9b0823708ec7',
              user_id: this.store.getters.getUser.id,
              name: 'Service',
              type: 'Verkauf+',
              info: this.service.id,
              amount: this.service.price
            })
            .eq('id', this.service.id)

            if(error) throw error
        }

      } catch (e) {
        console.log(e)
      }

      this.$router.push({ path: '/services' })
    }
  }
};
</script>

<style scoped>
.row {
  margin: 0 5%;
  padding: 0;
  text-align: left;
}

.overview {
  margin: 40px -5% 0 -5%;
}

.input-group-text {
  width: 40px;
}

form {
  margin-top: 40px;
}

.spinner {
  visibility: hidden;
  position: absolute;
}

button {
  margin-bottom: 100px;
}

.company_tile {
  margin: 15px;
}
</style>
