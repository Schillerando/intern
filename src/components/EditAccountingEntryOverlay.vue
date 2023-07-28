<template>
  <AlertPopup :title="this.alertTitle" :info="this.alertInfo" />

  <div class="overlay">
    <div class="card">
      <div class="card-header">
        <div>
          <h4 class="card-title">Eintrag</h4>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="stopEditingEntry()"
          ></button>
        </div>
      </div>
      <div class="card-body scroll">
        <!--
        <div class="image">
          <div v-if="product.image == null" class="no-image">
            <i class="fa-solid fa-image fa-2xl"></i>
          </div>
          <img
            v-else
            :src="this.product.image"
            alt="Unternehmen Bild"
            id="productImage"
          />
        </div>


        <input
          class="form-control form-control-sm col-7"
          type="file"
          id="formFile"
          accept="image/*"
          @change="imageInput()"
        />
        

        <p v-if="product.image == null" style="font-weight: 300; font-size: 0.9rem">Füge ein Bild hinzu, welches dein Produkt repräsentiert. (Optimales Format 1:1)</p>
        -->

        <form class="needs-validation" novalidate>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-list"></i
            ></span>
            <select
              class="form-select"
              id="entry-type"
              aria-label="Default select example"
              :value="entry.type"
              @change="validateEntry(false)"
              required
            >
              <option selected>Typ</option>
              <option value="Einkauf-">Einkauf</option>
              <option value="Gehalt-">Gehalt</option>
              <option value="Miete-">Miete</option>
              <option value="Steuern-">Steuern</option>
              <option value="Sonstige Ausgabe-">Sonstige Ausgabe</option>
              <option value="Verkauf+">
                Verkauf
              </option>
              <option value="Sonstige Einnahme+">
                Sonstige Einnahme
              </option>
            </select>
          </div>

          <div v-if="entry.type == 'Verkauf'" class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-list"></i
            ></span>
            <select
              class="form-select"
              id="entry-product"
              aria-label="Default select example"
              :value="entry.product.id"
              @change="validateEntry(false)"
            >
              <option selected>Produkt</option>
              <option v-for="product in this.products" :key="product.id" :value="product.id">{{ product.name }} | {{ product.price }} $</option>
            </select>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-box-open"></i></span>
            <input
              type="text"
              id="entry-name"
              class="form-control"
              @input="validateEntry(false)"
              placeholder="Name"
              :value="entry.name"
              required
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-dollar-sign"></i></span>
            <input
              type="number"
              id="entry-amount"
              class="form-control"
              @input="validateEntry(false)"
              placeholder="Betrag"
              :value="Math.abs(entry.amount)"
              required
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-circle-info"></i
            ></span>
            <textarea
              type="text"
              id="entry-info"
              class="form-control"
              @input="validateEntry(false)"
              placeholder="Beschreibung"
              maxlength="100"
              style="resize: none"
              rows="5"
              cols="50"
              :value="entry.info"
            ></textarea>
          </div>

          <!-- Zeitpunkt -->


        </form>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary save-button" @click="validateEntry(true)">Speichern</button>
        <button v-if="!this.delete && initialEntry.name != ''" class="btn btn-danger delete-button" @click="this.delete = true">Löschen</button>
        <div v-else-if="this.delete && initialEntry.name != ''" class="confirm">
          <button class="btn btn-primary confirm-button" @click="deleteEntry()">
            <i class="fa-solid fa-check fa-lg"></i>
          </button>
          <button class="btn btn-danger confirm-button" @click="this.delete = false">
            <i class="fa-solid fa-xmark fa-lg"></i>
          </button>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useStore, mapGetters } from 'vuex';
import AlertPopup from '../components/AlertPopup.vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.js';
import {v4 as uuidv4} from 'uuid';


export default {
  name: 'EditEntryOverlay',
  props: ['data', 'edit', 'products'],
  components: {
    AlertPopup,
  },
  emits: ['stopEditingEntry', 'deleteEntry'],
  data() {
    return {
      continuePressed: false,
      alertTitle: '',
      alertInfo: '',
      successAlertTitle: 'Erfolgreich',
      successAlertInfo: 'Aktion wurde erfolgreich durchgeführt',
      failureAlertTitle: 'Fehler',
      failureAlertInfo: 'Es ist ein Fehler aufgetreten!',
      delete: false
    }
  },
  setup() {
    var entry = reactive({
      id: null,
      name: '',
      type: '',
      info: '',
      amount: '',
      product: null,
      created_at: '',
      imageBefore: null, 
      image: null, 
      bill_picture: ''
    });

    var initialEntry = reactive({
      id: null,
      name: '',
      type: '',
      info: '',
      amount: '',
      product: null,
      created_at: '',
      imageBefore: null, 
      image: null, 
      bill_picture: ''
    });

    const store = useStore();

    return {
      store,
      entry,
      initialEntry
    };
  },
  mounted() {
    if(this.data != null) {
      this.entry.id = this.data.id;
      this.entry.name = this.data.name;
      this.entry.type = this.data.type;
      this.entry.info = this.data.info;
      this.entry.amount = this.data.amount;
      this.entry.product = this.products.find(product => product.id == this.data.product);
      this.entry.imageBefore = this.data.image;
      this.entry.image = this.data.image;
      this.entry.bill_picture = this.data.bill_picture;

      this.initialEntry.id = this.data.id;
      this.initialEntry.name = this.data.name;
      this.initialEntry.type = this.data.type;
      this.initialEntry.info = this.data.info;
      this.initialEntry.amount = this.data.amount;
      this.initialEntry.product = this.products.find(product => product.id == this.data.product);
      this.initialEntry.imageBefore = this.data.image;
      this.initialEntry.image = this.data.image;
      this.initialEntry.bill_picture = this.data.bill_picture;
    } else {
      this.entry.id = uuidv4();
      this.initialEntry.id = this.entry.id;
    }
  },
  computed: {
    ...mapGetters(['getState']),
  },
  watch: {
    getState(newValue) {
      var spinners = document.getElementsByClassName('spinner');
      var loadingButtons = document.getElementsByClassName('loading-button');

      if (newValue == 'loading') {
        Array.from(spinners).forEach((spinner) => {
          spinner.style.visibility = 'visible';
          spinner.style.position = 'relative';
        });

        Array.from(loadingButtons).forEach((button) => {
          button.style.visibility = 'hidden';
          button.style.position = 'absolute';
        });
      } else if (newValue == 'success') {
        Array.from(spinners).forEach((spinner) => {
          spinner.style.visibility = 'hidden';
          spinner.style.position = 'absolute';
        });

        Array.from(loadingButtons).forEach((button) => {
          button.style.visibility = 'visible';
          button.style.position = 'relative';
        });

        this.alertTitle = this.successAlertTitle;
        this.alertInfo = this.successAlertInfo;

        if (this.alertTitle != '') {
          alertModal = new Modal(document.getElementById('alertModal'), {});
          alertModal.show();
        }

        this.stopEditingEntry()
      } else {
        Array.from(spinners).forEach((spinner) => {
          spinner.style.visibility = 'hidden';
          spinner.style.position = 'absolute';
        });

        Array.from(loadingButtons).forEach((button) => {
          button.style.visibility = 'visible';
          button.style.position = 'relative';
        });

        this.alertTitle = this.failureAlertTitle;
        this.alertInfo = this.failureAlertInfo;

        if (this.alertTitle != '') {
          var alertModal = new Modal(document.getElementById('alertModal'), {});
          alertModal.show();
        }
      }
    },
  },
  methods: {
    async stopEditingEntry() {
      const newEntry = this.store.getters.getCurrentEntry; 
      this.store.commit('setCurrentEntry', null)
      if(newEntry != null) {
        this.entry.id = newEntry.id;
        this.entry.name = newEntry.name;
        this.entry.type = newEntry.type;
        this.entry.info = newEntry.info;
        this.entry.amount = newEntry.amount;
        this.entry.product = newEntry.product;
        this.entry.bill_picture = newEntry.bill_picture;

        /*
        if (newEntry.product_picture != null) {
          const response = await supabase.storage
            .from('public/products-pictures')
            .download(newEntry.product_picture);
          if (response.data != null) {
            this.product.image = await response.data.text();
            this.product.initialImage = this.product.image
          } 
          if (response.error) console.warn(response.error);
        }
        */
      } else {
        this.entry = null;
      }

      this.$emit('stopEditingEntry', this.entry)
    },
    deleteEntry() {
      this.$emit('deleteEntry', this.entry)
    },
    imageInput() {
      var input = document.getElementById('formFile');

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = e => {
          this.entry.image = e.target.result
        };

        reader.readAsDataURL(input.files[0]);
      }

    },
    async validateEntry(pressed) {
      var nameInput = document.getElementById('entry-name');
      var typeInput = document.getElementById('entry-type');
      var amountInput = document.getElementById('entry-amount');
      var infoInput = document.getElementById('entry-info');
      var productInput = document.getElementById('entry-product');

      this.entry.name = nameInput.value;
      this.entry.type = typeInput.value;
      this.entry.amount = amountInput.value;
      this.entry.infoInput = infoInput.value;

      this.entry.product = this.products.find(product => product.id == productInput.value);

      if (!pressed && !this.continuePressed) return;

      if (pressed) nameInput.value = nameInput.value.trim();
      if (pressed) infoInput.value = infoInput.value.trim();
      var valid = true;

      if (nameInput.value.trim().length < 3) {
        nameInput.classList.remove('is-valid');
        nameInput.classList.add('is-invalid');
        valid = false;
      } else {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid');
      }

      if (
        amountInput.value < -9999 ||
        amountInput.value > 9999 
      ) {
        amountInput.classList.remove('is-valid');
        amountInput.classList.add('is-invalid');
        valid = false;
      } else {
        amountInput.classList.remove('is-invalid');
        amountInput.classList.add('is-valid');
      }

      if (typeInput.value == 'Typ') {
        typeInput.classList.remove('is-valid');
        typeInput.classList.add('is-invalid');
        valid = false;
      } else {
        typeInput.classList.remove('is-invalid');
        typeInput.classList.add('is-valid');
      }

      this.continuePressed = true

      if (valid && pressed) {

        if(this.initialEntry == this.entry) {
          this.stopEditingEntry()
        } else {
          this.failureAlertTitle = 'Fehler'
          this.failureAlertInfo = 'Beim Aktualisieren des Eintrags ist ein Fehler aufgetreten. Versuche es später erneut.'
          this.successAlertTitle = ''

          if(this.initialEntry.name == '') {
            this.store.dispatch('addEntry', this.entry)
          } else {
            this.store.dispatch('updateEntry', this.entry)
          }

        }
      }
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  width: 100%; 
  height: 100%; 
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 20; 
  cursor: pointer; 
}

.card {
  position: relative;
  height: 82%;
  width: 90%;
  top: 12.5%;
  margin: auto;
  max-width: 500px;
}

.card-header {
  display: flex;
  padding-top: 12px;
}

.card-footer {
  padding-bottom: 45px;
}

.card-title {
  padding: 0;
  margin: 0;
  text-align: left;
  display: inline-block;
}

.btn-close {
  position: absolute;
  right: 15px;
}

.save-button {
  font-size: 1.1rem;
  position: absolute;
  bottom: 7px;
  right: 12px;
  padding: 5px 13px 5px 11px;
}

.delete-button {
  font-size: 1.1rem;
  position: absolute;
  bottom: 7px;
  left: 12px;
  padding: 5px 13px 5px 11px;
}

.confirm {
  position: absolute;
  bottom: 7px;
  left: 12px;
}

.confirm-button {
  margin-right: 10px;
}

.image {
  width: 60%;
  position: relative;
  padding-bottom: 60%;
  margin: 0 auto 10px auto;
}

.no-image {
  background-color: gray;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0.375rem;
}

img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
  left: 0;
}

.fa-image {
  position: absolute;
  font-size: 6rem;
  top: 50%;
  left: calc(50% - 3rem);
}


.input-group-text {
  width: 40px;
  padding: 0;
  padding-left: 9px;
}

#formFile {
  width: 60%;
  position: relative;
  margin: 0 auto 10px auto;
}

.scroll {
  overflow-y: auto;
}

.fa-dollar-sign {
 padding-left: 5px;
}

.fa-circle-info{
  padding-left: 1px;
}


</style>
