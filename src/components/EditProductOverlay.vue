<template>
  <AlertPopup :title="this.alertTitle" :info="this.alertInfo" />

  <div class="overlay">
    <div class="card">
      <div class="card-header">
        <div>
          <h4 class="card-title">Produkt</h4>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="stopEditingProduct()"
          ></button>
        </div>
      </div>
      <div class="card-body scroll">
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


        <form class="needs-validation" novalidate>
          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-box-open"></i></span>
            <input
              type="text"
              id="product-name"
              class="form-control"
              @input="validateProduct(false)"
              placeholder="Name"
              :value="product.name"
              required
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-dollar-sign"></i></span>
            <input
              type="number"
              id="product-price"
              class="form-control"
              @input="validateProduct(false)"
              placeholder="Preis"
              :value="product.price"
              required
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-list"></i
            ></span>
            <select
              class="form-select"
              id="product-category"
              aria-label="Default select example"
              :value="product.categories[0]"
              @change="validateProduct(false)"
            >
              <option selected>Kategorie</option>
              <option value="Essen">Essen</option>
              <option value="Trinken">Trinken</option>
              <option value="Dienstleistung">Dienstleistung</option>
              <option value="Gegenstand">Gegenstand</option>
              <option value="Aktivität">
                Aktivität
              </option>
              <option value="Event">
                Event
              </option>
              <option value="Sonstiges">
                Sonstiges
              </option>
            </select>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text"
              ><i class="fa-solid fa-circle-info"></i
            ></span>
            <textarea
              type="text"
              id="product-info"
              class="form-control"
              @input="validateProduct(false)"
              placeholder="Beschreibung"
              required
              maxlength="200"
              style="resize: none"
              rows="5"
              cols="50"
              :value="product.description"
            ></textarea>
          </div>

          <div class="switches">
            <div class="form-check form-switch">
              <input @click="switchDelivery" :checked="product.delivery" class="form-check-input" type="checkbox" role="switch" id="deliverySwitch">
              <label class="form-check-label" for="flexSwitchCheckChecked">Lieferbar</label>
            </div>
  
            <div class="form-check form-switch">
              <input @click="switchPrivate" :checked="!product.public" class="form-check-input" type="checkbox" role="switch" id="privateSwitch">
              <label class="form-check-label" for="flexSwitchCheckDefault">Privat (nur für Buchhaltung)</label>
            </div>
          </div>


        </form>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary save-button" @click="validateProduct(true)">Speichern</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useStore, mapGetters } from 'vuex';
import AlertPopup from '../components/AlertPopup.vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.js';
import { supabase } from '../supabase';


export default {
  name: 'EditProductOverlay',
  props: ['data', 'edit'],
  components: {
    AlertPopup,
  },
  emits: ['stopEditingProduct'],
  data() {
    return {
      continuePressed: false,
      alertTitle: '',
      alertInfo: '',
      successAlertTitle: 'Erfolgreich',
      successAlertInfo: 'Aktion wurde erfolgreich durchgeführt',
      failureAlertTitle: 'Fehler',
      failureAlertInfo: 'Es ist ein Fehler aufgetreten!',
    }
  },
  setup() {
    var product = reactive({
      id: null,
      name: '',
      description: '',
      categories: [],
      price: '',
      imageBefore: null, 
      image: null, 
      delivery: true,
      public: true,
    });

    var initialProduct = reactive({
      id: null,
      name: '',
      description: '',
      categories: [],
      price: '',
      imageBefore: null, 
      image: null, 
      delivery: true,
      public: true,
    });

    const store = useStore();

    return {
      store,
      product,
      initialProduct
    };
  },
  mounted() {
    if(this.data != null) {
      this.product.id = this.data.id;
      this.product.name = this.data.name;
      this.product.categories = this.data.categories;
      this.product.description = this.data.description;
      this.product.price = this.data.price;
      this.product.imageBefore = this.data.image;
      this.product.image = this.data.image;
      this.product.delivery = this.data.delivery;
      this.product.public = this.data.public;

      this.initialProduct.id = this.data.id;
      this.initialProduct.name = this.data.name;
      this.initialProduct.categories = this.data.categories;
      this.initialProduct.description = this.data.info;
      this.initialProduct.price = this.data.price;
      this.initialProduct.imageBefore = this.data.image;
      this.initialProduct.image = this.data.image;
      this.initialProduct.delivery = this.data.delivery;
      this.initialProduct.public = this.data.public;
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

        this.stopEditingProduct()
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
    async stopEditingProduct() {
      const newProduct = this.store.getters.getCurrentProduct 
      if(newProduct != null) {
        this.product.id = newProduct.id;
        this.product.name = newProduct.name;
        this.product.categories = newProduct.categories;
        this.product.description = newProduct.info;
        this.product.price = newProduct.price;
        this.product.delivery = newProduct.delivery;
        this.product.public = newProduct.public;

        if (newProduct.product_picture != null) {
          const response = await supabase.storage
            .from('public/products-pictures')
            .download(newProduct.product_picture);
          if (response.data != null) {
            this.product.image = await response.data.text();
            this.product.initialImage = this.product.image
          } 
          if (response.error) console.warn(response.error);
      }
      }

      this.$emit('stopEditingProduct', this.product)
    },
    switchDelivery() {
      this.product.delivery = !this.product.delivery
      this.product.public = this.product.delivery ? true : this.product.public

      console.log(this.product.delivery)
      console.log(this.product.public)
    },
    switchPrivate() {
      this.product.public = !this.product.public
      this.product.delivery = this.product.public ? this.product.delivery : false

      console.log(this.product.delivery)
      console.log(this.product.public)
    },
    imageInput() {
      var input = document.getElementById('formFile');

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = e => {
          this.product.image = e.target.result
        };

        reader.readAsDataURL(input.files[0]);
      }

    },
    async validateProduct(pressed) {
      var nameInput = document.getElementById('product-name');
      var priceInput = document.getElementById('product-price');
      var categoryInput = document.getElementById('product-category');
      var descriptionInput = document.getElementById('product-info');

      this.product.name = nameInput.value;
      this.product.price = priceInput.value;
      this.product.description = descriptionInput.value;
      this.product.categories = [categoryInput.value];

      if (!pressed && !this.continuePressed) return;

      if (pressed) nameInput.value = nameInput.value.trim();
      if (pressed) descriptionInput.value = descriptionInput.value.trim();
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
        priceInput.value < 0 ||
        priceInput.value > 9999 
      ) {
        priceInput.classList.remove('is-valid');
        priceInput.classList.add('is-invalid');
        valid = false;
      } else {
        priceInput.classList.remove('is-invalid');
        priceInput.classList.add('is-valid');
      }

      if (categoryInput.value == 'Kategorie') {
        categoryInput.classList.remove('is-valid');
        categoryInput.classList.add('is-invalid');
        valid = false;
      } else {
        categoryInput.classList.remove('is-invalid');
        categoryInput.classList.add('is-valid');
      }

      if (descriptionInput.value.trim().length < 5) {
        descriptionInput.classList.remove('is-valid');
        descriptionInput.classList.add('is-invalid');
        valid = false;
      } else {
        descriptionInput.classList.remove('is-invalid');
        descriptionInput.classList.add('is-valid');
      }

      this.continuePressed = true

      if (valid && pressed) {

        if(this.initialProduct == this.product) {
          this.stopEditingProduct()
        } else {
          this.failureAlertTitle = 'Fehler'
          this.failureAlertInfo = 'Beim Aktualisieren des Produkts ist ein Fehler aufgetreten. Versuche es später erneut.'
          this.successAlertTitle = ''

          this.store.dispatch('updateProduct', this.product)
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
  display: flex;
  justify-content: flex-end;
  height: 67px;
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

.switches {
  max-width: max-content;
  text-align: left;
  position: relative;
  margin: 20px auto;
}

</style>
