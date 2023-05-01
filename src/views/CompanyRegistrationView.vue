<template>
  <div>
    <AlertPopup :title="this.alertTitle" :info="this.alertInfo" />

    <div class="container">
      <div class="row justify-content-center">
        <div class="mb-4">
          <div class="card container-card p-4 pb-0">
            <div class="card-body">
              <h1>Unternehmen Registrierung</h1>
              <p class="text-muted">
                Registriere dein Unternehmen auf Schillerando
              </p>

              <!-- 0 -->
              <div v-if="this.page == 0" class="row">
                <div class="col-md-4">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3a/M%C3%BCnster%2C_LVM%2C_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg"
                    alt=""
                  />

                  <input
                    class="form-control form-control-sm col-7"
                    type="file"
                    id="formFile"
                    accept="image/*"
                  />
                </div>

                <div class="col-md-8">
                  <form class="needs-validation" novalidate>
                    <div class="input-group mb-3">
                      <span class="input-group-text"
                        ><i class="fa-solid fa-shop"></i
                      ></span>
                      <input
                        type="text"
                        id="signup-name"
                        class="form-control"
                        @input="validatePage(0, false)"
                        placeholder="Name"
                        :value="form.name"
                        required
                      />
                    </div>
                    <div class="input-group mb-3">
                      <span class="input-group-text"
                        ><i class="fa-solid fa-location-dot"></i
                      ></span>
                      <input
                        type="text"
                        id="signup-location"
                        class="form-control"
                        @input="validatePage(0, false)"
                        placeholder="Raum, Pausenhof, ..."
                        :value="form.location"
                        required
                      />
                    </div>

                    <div class="input-group mb-3">
                      <span class="input-group-text"
                        ><i class="fa-solid fa-list"></i
                      ></span>
                      <select
                        class="form-select"
                        id="signup-category"
                        aria-label="Default select example"
                        :value="form.category"
                        @change="validatePage(0, false)"
                      >
                        <option selected>Kategorie</option>
                        <option value="Gastronomie">Gastronomie</option>
                        <option value="Kultur">Kultur</option>
                        <option value="Dienstleistung">Dienstleistung</option>
                        <option value="Gastronomie & Dienstleistung">
                          Gastronomie & Dienstleistung
                        </option>
                      </select>
                    </div>

                    <div class="input-group mb-3">
                      <span class="input-group-text"
                        ><i class="fa-solid fa-circle-info"></i
                      ></span>
                      <textarea
                        type="text"
                        id="signup-info"
                        class="form-control"
                        @input="validatePage(0, false)"
                        placeholder="Beschreibung"
                        required
                        maxlength="400"
                        style="resize: none"
                        rows="5"
                        cols="50"
                        :value="form.description"
                      ></textarea>
                    </div>
                  </form>
                </div>
              </div>

              <!-- 1 -->
              <div v-else-if="this.page == 1">
                <h5 class="pt-4">
                  Füge Mitarbeiter hinzu, damit sie bei der Verwaltung deines
                  Unternehmens helfen können!
                </h5>

                <div class="py-3 row">
                  <div
                    class="col-md-6"
                    v-for="(employee, index) in form.employees"
                    :key="employee"
                  >
                    <div class="input-group mb-3">
                      <span class="input-group-text"
                        ><i class="fa fa-envelope"></i
                      ></span>
                      <input
                        type="email"
                        class="form-control signup-mail"
                        placeholder="Email"
                        @input="validatePage(1, false)"
                        data-regex="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                        :value="form.employees[index]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  v-if="this.form.employees.length < 6"
                  @click="addEmployee()"
                  class="btn btn-primary col-md-9 mb-5"
                  style="width: max-content"
                >
                  <div class="loading-button">Mitarbeiter hinzufügen</div>
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

              <!-- 2 -->
              <div v-else-if="this.page == 2">
                <h4>Produkte hinzufügen</h4>

                <div
                  class="product"
                  v-for="product in this.form.products"
                  :key="product"
                >
                  <div class="card d-flex mb-3">
                    <div>
                      {{ product.name }}
                    </div>
                    <div>
                      {{ product.description }}
                    </div>
                    <div>
                      {{ product.price }}
                    </div>
                    <div>
                      <button
                        type="button"
                        class="btn-close btn-edit"
                        aria-label="Edit"
                      ></button>
                    </div>
                    <div>
                      <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                      ></button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  @click="addProduct()"
                  class="btn btn-primary col-md-9 mt-3 mb-2"
                  style="width: max-content"
                >
                  <div class="loading-button">Produkt hinzufügen</div>
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

              <!-- 3 -->
              <div v-else-if="this.page == 3">
                <h4 class="pt-4">Abo wählen</h4>

                <div class="row abo flex-card">
                  <div class="col-lg-4">
                    <div
                      class="card mb-4 rounded-3 shadow-sm"
                      :class="{ selected: form.abo == 'Delivery' }"
                      @click="chooseAbo('Delivery')"
                    >
                      <div class="card-header py-3">
                        <h4 class="info-title my-0 fw-normal">Delivery</h4>
                      </div>
                      <div class="card-body">
                        <ul class="list-unstyled mt-3 mb-4">
                          <li class="info-text">
                            Offizieller Schillerando Partner
                          </li>
                          <li class="info-text">Blauer Haken</li>
                          <li class="info-text">Eigener QR-Code</li>
                          <li class="info-text">
                            Lieferungen mit 10% Kosten pro Lieferung
                          </li>
                        </ul>
                      </div>
                      <div class="card-footer">
                        <h3 class="mt-2">50$ (5€)</h3>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div
                      class="card mb-4 rounded-3 shadow-sm"
                      :class="{ selected: form.abo == 'Delivery+' }"
                      @click="chooseAbo('Delivery+')"
                    >
                      <div class="card-header py-3">
                        <h4 class="info-title my-0 fw-normal">Delivery+</h4>
                      </div>
                      <div class="card-body">
                        <ul class="list-unstyled mt-3 mb-4">
                          <li class="info-text">Kostenlose Lieferungen</li>
                          <li class="info-text">
                            Kostenlose Services, wie Müllentsorgung etc
                          </li>
                          <li class="info-text">Lieferung von Waren</li>
                        </ul>
                      </div>
                      <div class="card-footer">
                        <h3 class="mt-2">150$ (15€)</h3>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4">
                    <div
                      class="card mb-4 rounded-3 shadow-sm"
                      :class="{ selected: form.abo == 'Premium' }"
                      @click="chooseAbo('Premium')"
                    >
                      <div class="card-header py-3">
                        <h4 class="info-title my-0 fw-normal">Premium</h4>
                      </div>
                      <div class="card-body">
                        <ul class="list-unstyled mt-3 mb-4">
                          <li class="info-text">
                            Schillerando Premium Partner
                          </li>
                          <li class="info-text">Bevorzugung auf Website</li>
                          <li class="info-text">Werbung</li>
                          <li class="info-text">
                            kostenlose Lieferung von Waren
                          </li>
                        </ul>
                      </div>
                      <div class="card-footer">
                        <h3 class="mt-2">250$ (25€)</h3>
                      </div>
                    </div>
                  </div>

                  <div class="col-12">
                    <div
                      class="card mb-3 rounded-3 shadow-sm"
                      style="text-align: center"
                      :class="{ selected: form.abo == 'Free' }"
                      @click="chooseAbo('Free')"
                    >
                      <div class="card-body">
                        ODER: Kostenlose Registrierung ohne Lieferungen (kann
                        später upgegradet werden)
                      </div>
                    </div>
                  </div>

                  <div
                    class="alert alert-danger"
                    id="alert-danger"
                    role="alert"
                  >
                    Bitte wähle ein Abo aus!
                  </div>
                </div>
              </div>

              <!-- 4 -->
              <div v-else-if="this.page == 4">
                <h4>Bedingungen</h4>

                <div
                  class="card mb-4"
                  style="overflow-y: scroll; height: 400px"
                ></div>

                <div class="form-check mb-4">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    id="acceptCheck"
                    @change="validatePage(4, false)"
                  />
                  <label class="form-check-label" for="acceptCheck">
                    Bedingungen akzeptieren
                  </label>
                </div>
              </div>

              <div style="height: 50px"></div>

              <div class="back" v-if="this.page > 0">
                <button
                  type="button"
                  @click="this.page--"
                  class="btn btn-secondary"
                >
                  <div class="loading-button">Zurück</div>
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

              <div class="skip" v-if="this.page == 1 || this.page == 2">
                <button
                  type="button"
                  @click="skipPage()"
                  class="btn btn-secondary"
                >
                  <div class="loading-button">Später</div>
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

              <div class="continue" v-if="this.page != 4">
                <button
                  type="button"
                  @click="validatePage(page, true)"
                  class="btn btn-primary"
                >
                  <div class="loading-button">Weiter</div>
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

              <div class="continue" v-if="this.page == 4">
                <button
                  type="button"
                  @click="validatePage(page, true)"
                  class="btn btn-primary"
                >
                  <div class="loading-button">Registrieren</div>
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

          <div class="progress-container">
            <div class="progress" style="height: 20px">
              <div
                class="progress-bar"
                id="progress"
                role="progressbar"
                aria-label="Example 20px high"
                style="width: 20%"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useStore, mapGetters } from 'vuex';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.js';
import AlertPopup from '../components/AlertPopup.vue';
import { supabase } from '@/supabase';

export default {
  name: 'CompanyRegistrationView',
  components: {
    AlertPopup,
  },
  data() {
    return {
      page: 0,
      continuePressed: false,
      action: '',
      alertTitle: '',
      alertInfo: '',
      successAlertTitle: 'Erfolgreich',
      successAlertInfo: 'Aktion wurde erfolgreich durchgeführt',
      failureAlertTitle: 'Fehler',
      failureAlertInfo: 'Es ist ein Fehler aufgetreten!',
    };
  },
  computed: {
    ...mapGetters(['getState']),
  },
  watch: {
    page: function () {
      const progressBar = document.getElementById('progress');
      progressBar.style.width = (this.page + 1) * 20 + '%';
    },
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

        if (this.alertTitle == '') return;
        alertModal = new Modal(document.getElementById('alertModal'), {});
        alertModal.show();
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

        if (this.alertTitle == '') return;
        var alertModal = new Modal(document.getElementById('alertModal'), {});
        alertModal.show();

        if (this.action == 'register') {
          this.signUpFailure();
        }
      }
    },
  },
  setup() {
    const form = reactive({
      name: '',
      location: '',
      category: 'Kategorie',
      description: '',
      employees: [''],
      products: [],
      abo: '',
    });

    const product = reactive({
      name: '',
      description: '',
      categories: [],
      price: '',
    });

    const store = useStore();

    return {
      store,
      form,
      product,
    };
  },
  methods: {
    addEmployee() {
      var mailInputs = document.getElementsByClassName('signup-mail');

      var index = 0;
      Array.from(mailInputs).forEach((input) => {
        this.form.employees[index] = input.value;
        index++;
      });

      this.form.employees.push('');
    },
    addProduct() {
      this.form.products.push({
        name: 'Cola',
        description: 'Eine normale Cola',
        category: 'Getränk',
        price: 25,
      });
    },
    chooseAbo(abo) {
      this.form.abo = abo;
      this.validatePage(3, false);
    },
    skipPage(page) {
      if (page == 1) {
        this.form.employees = [''];
      } else if (page == 2) {
        this.form.products = [];
      }

      this.page++;
    },
    async validatePage(page, pressed) {
      if (!pressed && !this.continuePressed) return;

      if (page == 0) {
        var nameInput = document.getElementById('signup-name');
        var locationInput = document.getElementById('signup-location');
        var categoryInput = document.getElementById('signup-category');
        var descriptionInput = document.getElementById('signup-info');

        if (pressed) nameInput.value = nameInput.value.trim();
        if (pressed) locationInput.value = locationInput.value.trim();
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
          locationInput.value.trim().length < 3 ||
          locationInput.value.trim().length > 40
        ) {
          locationInput.classList.remove('is-valid');
          locationInput.classList.add('is-invalid');
          valid = false;
        } else {
          locationInput.classList.remove('is-invalid');
          locationInput.classList.add('is-valid');
        }

        if (categoryInput.value == 'Kategorie') {
          categoryInput.classList.remove('is-valid');
          categoryInput.classList.add('is-invalid');
          valid = false;
        } else {
          categoryInput.classList.remove('is-invalid');
          categoryInput.classList.add('is-valid');
        }

        if (descriptionInput.value.trim().length < 10) {
          descriptionInput.classList.remove('is-valid');
          descriptionInput.classList.add('is-invalid');
          valid = false;
        } else {
          descriptionInput.classList.remove('is-invalid');
          descriptionInput.classList.add('is-valid');
        }

        this.continuePressed = true;

        if (valid && pressed) {
          this.store.commit('setState', 'loading');

          const { data, error } = await supabase
            .from('companies')
            .select()
            .eq('id', nameInput.value.replace(/\s/g, '').toLowerCase());

          if (error || data[0] != null) {
            this.failureAlertTitle = 'Name schon vergeben';
            this.failureAlertInfo =
              'Es gibt bereits ein Unternehmen mit diesem Namen. Bitte wähle einen anderen!';
            this.store.commit('setState', 'failure');
            nameInput.classList.remove('is-valid');
            nameInput.classList.add('is-invalid');

            this.form.name = nameInput.value;
            this.form.location = locationInput.value;
            this.form.description = descriptionInput.value;
            this.form.category = categoryInput.value;

            return;
          }

          this.successAlertTitle = '';
          this.store.commit('setState', 'success');

          this.form.name = nameInput.value;
          this.form.location = locationInput.value;
          this.form.description = descriptionInput.value;
          this.form.category = categoryInput.value;

          console.log(this.form);

          this.continuePressed = false;
          this.page++;
        }
      } else if (page == 1) {
        var mailInputs = document.getElementsByClassName('signup-mail');
        valid = true;

        var regex = mailInputs[0].getAttribute('data-regex');
        Array.from(mailInputs).forEach((input) => {
          input.value = input.value.replace(/\s/g, '');

          if (!input.value.match(regex) && input.value != '') {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            valid = false;
          } else {
            input.classList.remove('is-invalid');
            if (input.value != '') {
              input.classList.add('is-valid');
            }
          }
        });

        this.continuePressed = true;

        if (valid && pressed) {
          var index = 0;
          Array.from(mailInputs).forEach((input) => {
            this.form.employees[index] = input.value;
            index++;
          });

          this.continuePressed = false;
          this.page++;
        }
      } else if (page == 2) {
        this.page++;
      } else if (page == 3) {
        const invalidAbo = document.getElementById('alert-danger');
        valid = false;

        if (this.form.abo == '') {
          invalidAbo.style.visibility = 'visible';
          invalidAbo.style.position = 'relative';
        } else {
          invalidAbo.style.visibility = 'hidden';
          invalidAbo.style.position = 'absolute';
          valid = true;
        }

        this.continuePressed = true;

        if (valid && pressed) {
          console.log(this.form);

          this.continuePressed = false;
          this.page++;
        }
      } else if (page == 4) {
        const check = document.getElementById('acceptCheck');
        valid = false;

        if (!check.checked) {
          check.classList.add('is-invalid');
          check.classList.remove('is-valid');
        } else {
          check.classList.remove('is-invalid');
          check.classList.add('is-valid');
          valid = true;
        }

        this.continuePressed = true;

        if (valid && pressed) {
          this.continuePressed = false;
          this.signUp();
        }
      }
    },
    signUp() {
      this.store.dispatch('createCompany', this.form);

      this.failureAlertTitle = 'Registrierung fehlgeschlagen';
      this.failureAlertInfo =
        'Bei der Registrierung deines Unternehmens ist ein Fehler aufgetreten! Versuche es später erneut.';
      this.successAlertTitle = '';
    },
    signUpFailure() {
      var mailInput = document.getElementById('signup-mail');
      mailInput.classList.remove('is-valid');
      mailInput.classList.add('is-invalid');

      var feedbacks = document.getElementsByClassName('invalid-feedback');
      Array.from(feedbacks).forEach((feedback) => {
        feedback.style.visibility = 'hidden';
        feedback.style.position = 'absolute';
      });
    },
    removeValidation() {
      const mailInput = document.getElementById('reset-mail');
      mailInput.value = '';
      mailInput.classList.remove('is-valid');
      mailInput.classList.remove('is-invalid');
    },
  },
};
</script>

<style scoped>
.container-card {
  position: relative;
  width: 95%;
  height: 95%;
  margin: 2.5% auto;
  text-align: left;
}

.progress-container {
  position: relative;
  width: 95%;
  margin: 0 auto;
}

@media (max-width: 576px) {
  .container-card {
    text-align: center;
  }
}

.continue {
  position: absolute;
  right: 20px;
  bottom: 20px;
}

.back {
  position: absolute;
  left: 20px;
  bottom: 20px;
}

.skip {
  position: absolute;
  right: 110px;
  bottom: 20px;
}

.text-muted {
  color: #9faecb !important;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}
.mb-3 {
  margin-bottom: 1rem !important;
}

.spinner {
  visibility: hidden;
  position: absolute;
}

img {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.progress-bar {
  background-color: #00a100;
}

.input-group-text {
  width: 40px;
  padding: 0;
  padding-left: 10px;
}

#formFile {
  margin-bottom: 50px;
}

.abo .card {
  text-align: center;
}

.abo .card:hover {
  cursor: pointer;
}

.flex-card > div > div.card {
  height: calc(100% - 15px);
  margin-bottom: 15px;
}

.selected {
  border-color: rgb(0, 94, 201);
  border-width: 2px;
}

.alert-danger {
  text-align: center;
  visibility: hidden;
  position: absolute;
}

.product .card div {
  margin: 5px 10px;
}

.product .d-flex {
  flex-direction: row;
}

.fa-location-dot {
  position: relative;
  left: 3px;
}
</style>
