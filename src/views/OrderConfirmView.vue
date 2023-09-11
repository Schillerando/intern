<template>

  <div v-if="order != null && !loading">
    <div class="row">
      <div class="col-lg-6">
        <div class="overview">
          <OrderTile :data="this.order" :drivers="this.drivers" />
        </div>

      </div>

      <div class="col-lg-6">

        <form class="mx-3">
          <div class="form-check mt-4">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="order-check1"
              @change="validateOrder(false)"
            />
            <label class="form-check-label" for="acceptCheck">
              Kunde hat die Lieferung entgegen genommen
            </label>
          </div>
          <div class="form-check mt-2 mb-4">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="order-check2"
              @change="validateOrder(false)"
            />
            <label class="form-check-label" for="acceptCheck">
              Kunde hat den vollen Preis der Lieferung
            </label>
          </div>
  
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
              :value="this.order.review"
            ></textarea>
          </div>
        </form>
        
        <button
          type="button"
          @click="validateOrder(true)"
          class="btn btn-primary order-button mx-3"
        >
          <div class="loading-button">Bestätigen</div>
          <div class="spinner">
            <span
              class="spinner-border spinner-border-sm"
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
import OrderTile from '@/components/OrderTile.vue';
import { useStore } from 'vuex'

export default {
  name: 'OrderConfirmView',
  components: {
    OrderTile
  },
  data() {
    return {
      order: null,
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
        .from('orders')
        .select()
        .eq('id', this.$route.params.orderid)

      if(error) throw error;

      if(data.length == 0) this.error = 'Lieferung nicht gefunden'

      this.order = data[0]

      if(this.$route.query.user_id != this.order.buyer) {
        this.error = 'Nutzerdaten falsch'
        this.order = null;
      }
      else if(this.order.driver == null) {
        this.error = 'Lieferung wird noch zugewiesen'
        this.order = null;
      }
      else if(this.order.payed == true && this.order.delivered == true) {
        this.error = 'Lieferung wurde schon bestätigt'
        this.order = null;
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
    validateOrder(pressed) {
      if(!pressed && !this.confirmPressed) return

      var valid = true;

      var checkInput1 = document.getElementById('order-check1');
      var checkInput2 = document.getElementById('order-check2');

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
        this.confirmOrder()
      }
    },
    async confirmOrder() {
      var reviewInput = document.getElementById('order-review');

      try {
        var today = new Date()

        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        const { error } = await supabase
          .from('orders')
          .update({
            delivered: true,
            payed: true,
            review: reviewInput.value,
            delivery_time: time
          })
          .eq('id', this.order.id)

        if(error) throw error

        if(this.order.order_price != this.order.to_pay) {
          const { error } = await supabase
            .from('accounting')
            .insert({
              company_id: '9d1f8296-4360-4ca8-b19e-9b0823708ec7',
              user_id: this.store.getters.getUser.id,
              name: 'Lieferung',
              type: 'Verkauf+',
              info: this.order.id,
              amount: this.order.order_price - this.order.to_pay
            })
            .eq('id', this.order.id)

            if(error) throw error
        }

      } catch (e) {
        console.log(e)
      }

      this.$router.push({ path: '/orders' })
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
</style>
