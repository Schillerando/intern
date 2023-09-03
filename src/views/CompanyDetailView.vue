<template>
  <div style="margin-bottom: 100px;" v-if="company != undefined">
    <AlertPopup :title="this.alertTitle" :info="this.alertInfo" />

    <div class="nav" aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item"><a class="page-link" @click="this.page = 0">Einstellungen</a></li>
        <li class="page-item"><a class="page-link" @click="this.page = 1">Produkte</a></li>
        <li class="page-item"><a class="page-link" @click="this.page = 2">Buchhaltung</a></li>
      </ul>
    </div>

    <div v-if="this.page == 0" class="container">
      <div class="row">

        <div class="col-12">
          <div
            v-if="company.verified == false"
            class="alert alert-warning"
            role="alert"
          >
            Das Unternehmen muss noch überprüft werden.
          </div>
        </div>
        
        <div class="col-lg-8">
          <div class="card m-1">
            <div class="card-header">Informationen</div>
            <div class="card-body">
              <div class="image">
                <div v-if="form.image == null" class="no-image">
                  <i class="fa-solid fa-image fa-2xl"></i>
                </div>
                <img
                  v-else
                  :src="this.form.image"
                  alt="Unternehmen Bild"
                  id="companyImage"
                />
              </div>

              <input
                class="form-control form-control-sm mb-4"
                type="file"
                id="formFile"
                accept="image/*"
                @change="imageInput()"
                :disabled="!isCompanyEditing"
              />

              <form class="needs-validation" novalidate>
                <div class="input-group mb-3">
                  <span class="input-group-text"
                    ><i class="fa-solid fa-shop"></i
                  ></span>
                  <input
                    type="text"
                    id="company-name"
                    class="form-control"
                    placeholder="Name"
                    @input="validateCompanyChange(false)"
                    :value="company.name"
                    :disabled="!isCompanyEditing"
                    required
                  />
                </div>
                <div class="input-group mb-3">
                  <span class="input-group-text"
                    ><i class="fa-solid fa-location-dot"></i
                  ></span>
                  <input
                    type="text"
                    id="company-location"
                    class="form-control"
                    placeholder="Raum, Pausenhof, ..."
                    @input="validateCompanyChange(false)"
                    :value="company.location"
                    :disabled="!isCompanyEditing"
                    required
                  />
                </div>
    
                <div class="input-group mb-3">
                  <span class="input-group-text"
                    ><i class="fa-solid fa-list"></i
                  ></span>
                  <select
                    class="form-select"
                    id="company-category"
                    aria-label="Default select example"
                    :value="company.categories[0]"
                    @change="validateCompanyChange(false)"
                    :disabled="!isCompanyEditing"
                    required
                    :color="{ isCompanyEditing: 'red' }"
                  >
                    <option selected>Kategorie</option>
                    <option value="Gastronomie">Gastronomie</option>
                    <option value="Kultur">Kultur</option>
                    <option value="Dienstleistung">
                      Dienstleistung
                    </option>
                    <option style="color:red" value="Gastronomie & Dienstleistung">
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
                    id="company-info"
                    class="form-control"
                    placeholder="Beschreibung"
                    required
                    maxlength="400"
                    style="resize: none"
                    rows="5"
                    cols="50"
                    @input="validateCompanyChange(false)"
                    :value="company.info"
                    :disabled="!isCompanyEditing"
                  ></textarea>
                </div>

                <div class="status">
                  <CompanyBadge
                    :verified="company.abo != null && company.abo != ''"
                    :premium="company.abo == 'Business'"
                    :self="company.alias == 'schillerando'"
                    class="company-badge"
                  ></CompanyBadge>

                  <p class="abo">
                    {{ company.abo }}
                  </p>
                </div>

                <div class="leader" v-if="company.users != null">
                  Geschäftsführer: <span style="font-weight: bold;">{{ company.users.name }}</span> | <a :href="'mailto:' + company.users.email">{{ company.users.email }}</a>
                </div>

                <div class="form-check form-switch">
                  <input :disabled="!isCompanyEditing" @click="validateCompanyChange(false)" :checked="company.verified" class="form-check-input" type="checkbox" role="switch" id="company-verified">
                  <label class="form-check-label" for="flexSwitchCheckChecked">Verifiziert</label>
                </div>
              </form>
    
              <div
                v-if="!isCompanyEditing"
                class="py-2"
                style="width: fit-content"
              >
                <button
                  type="button"
                  class="btn btn-primary px-2 mx-2"
                  @click="editCompany()"
                >
                  Bearbeiten
                </button>
              </div>
              <div v-else style="display: flex">
                <div class="py-2 mx-0 edit-buttons">
                  <button
                    type="button"
                    class="btn btn-primary px-2 mx-2"
                    @click="validateCompanyChange(true)"
                  >
                    <div class="loading-button">Speichern</div>
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
                <div class="py-2 mx-0 edit-buttons">
                  <button
                    type="button"
                    class="btn btn-warning px-2 mx-2"
                    @click="cancelCompanyChange()"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        <div class="col-lg-4">
          <div class="card m-1">
            <div class="card-header">Mitarbeiter</div>
            <div class="card-body">
              <div
                v-for="(employee, index) in this.employees"
                :key="employee"
              >
                <div class="input-group mb-3">
                  <span class="input-group-text"
                    ><i class="fa fa-envelope"></i
                  ></span>
                  <input
                    type="email"
                    class="form-control employees-mail"
                    placeholder="Email"
                    data-regex="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    :value="employees[index]"
                    :disabled="!isEmployeesEditing"
                    required
                    @input="validateEmployeesChange(false, index)"
                  />
                  <button
                    v-if="isEmployeesEditing"
                    class="input-group-text"
                    @click="employees.splice(index, 1)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
    
              <div>
                <div
                  v-if="!isEmployeesEditing"
                  class="py-2"
                  style="width: fit-content"
                >
                  <button
                    type="button"
                    class="btn btn-primary px-2 mx-2"
                    @click="editEmployees()"
                  >
                    Bearbeiten
                  </button>
                </div>
                <div v-else>
                  <button
                    type="button"
                    v-if="this.employees.length < 6"
                    @click="addEmployee()"
                    class="btn btn-primary my-4"
                    style="width: max-content; display: block"
                  >
                    Mitarbeiter hinzufügen
                  </button>
                  <div style="display: flex">
                    <div class="py-2 mx-0 edit-buttons">
                      <button
                        type="button"
                        class="btn btn-primary px-2 mx-2"
                        @click="validateEmployeesChange(true, 0)"
                      >
                        <div class="loading-button">Speichern</div>
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
                    <div class="py-2 mx-0 edit-buttons">
                      <button
                        type="button"
                        class="btn btn-warning px-2 mx-2"
                        @click="cancelEmployeesChange()"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ProductView v-else-if="this.page == 1" :companyData="company"></ProductView>
    <AccountingView v-else-if="this.page == 2" :companyData="company"></AccountingView>
  </div>
</template>

<script>
import { supabase } from '../supabase';
import { reactive } from 'vue';
import { useStore, mapGetters } from 'vuex';
import { computed } from 'vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.js';
import AlertPopup from '../components/AlertPopup.vue';
import CompanyBadge from '../components/CompanyBadge.vue';
import AccountingView from './AccountingView.vue';
import ProductView from './ProductView.vue';


export default {
  name: 'CompanyDetailView',
  props: ['companyuuid'],
  components: {
    AlertPopup,
    AccountingView,
    ProductView,
    CompanyBadge
  },
  data() {
    return {
      company: undefined,
      page: 0,
      isCompanyEditing: false,
      isEmployeesEditing: false,
      saveCompanyPressed: false,
      saveEmployeesPressed: false,
      employees: [],
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
  setup() {
    const store = useStore();

    const userData = computed(() => store.state.user);

    const form = reactive({
      name: '',
      location: '',
      category: 'Kategorie',
      info: '',
      employees: [''],
      image: null, 
      unchangedImage: null,
      verified: null
    });

    return {
      store,
      userData,
      form,
    };
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
      }
    },
  },
  async mounted() {
    if (this.$route.params.companyalias) {
      const { data, error } = await supabase
        .from('companies')
        .select('*, users(*)')
        .eq('alias', this.$route.params.companyalias);
      if (error != null) console.log(error);
      if (data === null || data.length === 0) {
        this.company = null;
        return;
      }
      this.company = data[0];
      this.employees = this.company.employees

      if (this.company.header_picture != null) {
        const response = await supabase.storage
          .from('public/sellers-headings')
          .download(this.company.header_picture);
        if (response.data != null) {
          this.form.image = await response.data.text();
          this.form.unchangedImage = await response.data.text();
        }
        if (response.error) console.warn(response.error);
      }
    }
  },
  methods: {
    imageInput() {
      var input = document.getElementById('formFile');

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = e => {
          this.form.image = e.target.result
        };

        reader.readAsDataURL(input.files[0]);
      }

    },
    addEmployee() {
      var emailInputs = document.getElementsByClassName('employees-mail');
      var index = 0;
      Array.from(emailInputs).forEach((input) => {
        this.employees[index] = input.value;
        input.classList.remove('is-valid');
        input.classList.remove('is-invalid');
        index++;
      });

      this.employees.push('');
    },
    cancelChanges() {
      this.cancelCompanyChange();
    },
    editCompany() {
      this.isCompanyEditing = true;

      var nameInput = document.getElementById('company-name');
      var locationInput = document.getElementById('company-location');
      var categoryInput = document.getElementById('company-category');
      var descriptionInput = document.getElementById('company-info');
      var verifiedInput = document.getElementById('company-verified');
      nameInput.disabled = false;
      locationInput.disabled = false;
      categoryInput.disabled = false;
      descriptionInput.disabled = false;
      verifiedInput.disabled = false;
    },
    editEmployees() {
      this.isEmployeesEditing = true;

      var emailInputs = document.getElementsByClassName('employees-mail');
      Array.from(emailInputs).forEach((input) => {
        input.disabled = false;
      });
    },
    async validateCompanyChange(pressed) {
      if (!pressed && !this.saveCompanyPressed) return;

      var nameInput = document.getElementById('company-name');
      var locationInput = document.getElementById('company-location');
      var categoryInput = document.getElementById('company-category');
      var descriptionInput = document.getElementById('company-info');
      var verifiedInput = document.getElementById('company-verified');

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

      this.saveCompanyPressed = true;

      if (valid && pressed) {
        this.store.commit('setState', 'loading');

        if (
          nameInput.value.replace(/\s/g, '').toLowerCase() !=
          this.company.alias
        ) {
          const { data, error } = await supabase
            .from('companies')
            .select()
            .eq('alias', nameInput.value.replace(/\s/g, '').toLowerCase());

          if (error || data[0] != null) {
            nameInput.classList.remove('is-valid');
            nameInput.classList.add('is-invalid');

            this.form.name = nameInput.value;
            this.form.location = locationInput.value;
            this.form.category = categoryInput.value;
            this.form.info = descriptionInput.value;
            this.form.verified = verifiedInput.checked;

            this.failureAlertTitle = 'Name schon vergeben';
            this.failureAlertInfo =
              'Es gibt bereits ein Unternehmen mit diesem Namen. Bitte wähle einen anderen!';
            this.store.commit('setState', 'failure');

            return;
          }
        }

        this.form.name = nameInput.value;
        this.form.location = locationInput.value;
        this.form.info = descriptionInput.value;
        this.form.category = categoryInput.value;
        this.form.verified = verifiedInput.checked;

        this.saveCompany();
      }
    },
    validateEmployeesChange(pressed, index) {
      if (!pressed && !this.saveEmployeesPressed) return;

      var emailInputs = document.getElementsByClassName('employees-mail');
      var regex = emailInputs[index].getAttribute('data-regex');
      var valid = true;

      if (!pressed) {
        if (!emailInputs[index].value.match(regex)) {
          emailInputs[index].classList.remove('is-valid');
          emailInputs[index].classList.add('is-invalid');
          valid = false;
        } else {
          emailInputs[index].classList.remove('is-invalid');
          emailInputs[index].classList.add('is-valid');
        }
      } else {
        Array.from(emailInputs).forEach((input) => {
          if (!input.value.match(regex)) {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            valid = false;
          } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
          }
        });
      }

      this.saveEmployeesPressed = true;

      if (valid && pressed) this.saveEmployees();
    },
    async saveCompany() {
      try {
        this.isCompanyEditing = false;
        this.saveCompanyPressed = false;

        var nameInput = document.getElementById('company-name');
        var locationInput = document.getElementById('company-location');
        var categoryInput = document.getElementById('company-category');
        var descriptionInput = document.getElementById('company-info');

        const { data, error } = await supabase
          .from('companies')
          .update({
            alias: this.form.name.replace(/\s/g, '').toLowerCase(),
            name: this.form.name,
            categories: [this.form.category],
            location: this.form.location,
            info: this.form.info,
            verified: this.form.verified
          })
          .eq('id', this.company.id)
          .select();

        console.log(data)
        console.log(error)

        if (error) throw error;

        if (this.form.image != null && this.form.image != this.form.unchangedImage) {

          {
            const { error } = await supabase
              .storage
              .from('sellers-headings')
              .remove([data[0].header_picture])

            if (error) throw error;
          }

          var type = this.form.image.substring(this.form.image.indexOf(':'), this.form.image.indexOf(';')).replace(':', '')
          var fileName = data[0].id + '.' + type.split('/')[1]

          {
            const { error } = await supabase
              .storage
              .from('sellers-headings')
              .upload(fileName, this.form.image, {
                cacheControl: '3600',
                upsert: true,
                contentType: type
              })

            if (error) throw error;

          }

          {
            const { error } = await supabase
              .from('companies')
              .update({ header_picture: fileName })
              .eq('id', data[0].id)

              if (error) throw error;
          }
        }

        this.successAlertTitle = '';
        this.store.commit('setState', 'success');

        nameInput.classList.remove('is-valid');
        nameInput.classList.remove('is-invalid');
        locationInput.classList.remove('is-valid');
        locationInput.classList.remove('is-invalid');
        categoryInput.classList.remove('is-valid');
        categoryInput.classList.remove('is-invalid');
        descriptionInput.classList.remove('is-valid');
        descriptionInput.classList.remove('is-invalid');
      } catch (error) {
        this.failureAlertTitle = 'Fehler';
        this.failureAlertInfo =
          'Beim Ändern der Unternehmens-Daten ist ein Fehler aufgetreten!';
        this.store.commit('setState', 'failure');
        this.cancelCompanyChange();
        console.log(error.error_description || error.message);
      }
    },
    async saveEmployees() {
      try {
        const employees = [];

        var emailInputs = document.getElementsByClassName('employees-mail');
        Array.from(emailInputs).forEach((input) => {
          if (input.value != '') employees.push(input.value);
          input.classList.remove('is-valid');
          input.classList.remove('is-invalid');
        });

        if (
          JSON.stringify(employees) !=
          JSON.stringify(this.company.employees)
        ) {
          const { error } = await supabase
            .from('companies')
            .update({ employees: employees })
            .eq('user_uid', this.userData.id);

          if (error) throw error;
        }

        this.isEmployeesEditing = false;
        this.saveEmployeesPressed = false;

        Array.from(emailInputs).forEach((input) => {
          input.classList.remove('is-valid');
          input.classList.remove('is-invalid');
        });
      } catch (error) {
        this.failureAlertTitle = 'Fehler';
        this.failureAlertInfo =
          'Beim Ändern der Mitarbeiter ist ein Fehler aufgetreten!';
        this.store.commit('setState', 'failure');
        this.cancelEmployeesChange();
        console.log(error.error_description || error.message);
      }
    },
    cancelCompanyChange() {
      this.isCompanyEditing = false;
      this.saveCompanyPressed = false;

      var nameInput = document.getElementById('company-name');
      var locationInput = document.getElementById('company-location');
      var categoryInput = document.getElementById('company-category');
      var descriptionInput = document.getElementById('company-info');

      nameInput.value = this.company.name;
      locationInput.value = this.company.location;
      categoryInput.value = this.company.categories[0];
      descriptionInput.value = this.company.info;

      nameInput.classList.remove('is-valid');
      nameInput.classList.remove('is-invalid');
      locationInput.classList.remove('is-valid');
      locationInput.classList.remove('is-invalid');
      categoryInput.classList.remove('is-valid');
      categoryInput.classList.remove('is-invalid');
      descriptionInput.classList.remove('is-valid');
      descriptionInput.classList.remove('is-invalid');
    },
    cancelEmployeesChange() {
      this.isEmployeesEditing = false;
      this.saveEmployeesPressed = false;

      this.employees = this.company.employees.filter(
        (employee) => employee != ''
      );

      console.log(this.employees);

      var emailInputs = document.getElementsByClassName('employees-mail');
      var index = 0;
      Array.from(emailInputs).forEach((input) => {
        input.value = this.employees[index];
        input.classList.remove('is-valid');
        input.classList.remove('is-invalid');
        index++;
      });
    },
  },
};
</script>

<style scoped>
.form-switch {
  width: fit-content;
  margin-bottom: 20px;
}

.container {
  position: relative;
  text-align: center;
  width: 96%;
  padding: 0;
  margin: 50px auto;
  font-size: 1.1rem;
}

.nav {
  display: inline-block;
  position: relative;
  text-align: center;
  margin: 50px auto 0 auto;
}

.card {
  margin: 10px 0;
}

.row {
  margin: 0;
  padding: 0;
}

.d-flex {
  flex-direction: row;
}

.credit {
  margin: auto 0;
  font-size: 1.5rem;
  font-weight: 300;
}

.credit-number {
  font-size: 2rem;
  font-weight: 600;
}

.data {
  text-align: left;
  font-weight: 300;
}

.action {
  background-color: #00a100;
  color: white;
}

.register {
  width: fit-content;
  margin: 0 auto;
}

.order .card div {
  margin: 5px 10px;
}

.product-count {
  width: 40px;
}

.product-count i {
  margin-left: 2px;
}

.price {
  width: 70px;
}

.input-group-text {
  width: 40px;
  padding: 0;
  padding-left: 10px;
}

.fa-location-dot {
  position: relative;
  left: 3px;
}

.fa-envelope {
  position: relative;
  left: 1px;
}
.fa-user {
  position: relative;
  left: 3px;
}

.fa-trash {
  position: relative;
  left: 1px;
  color: red;
}

.spinner {
  visibility: hidden;
  position: absolute;
}

.edit-buttons {
  display: inline;
  float: left;
  width: fit-content;
}

.pay-setup:hover {
  transform: scale(1.02);
}

.pay-setup:active {
  transform: scale(0.98);
}

.pay-setup {
  border: none;
  transition: all 0.2s ease-in-out;
}

.image {
  width: 100%;
  position: relative;
  padding-bottom: 56.25%;
  margin-bottom: 10px;
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

.status {
  display: flex;
}

.abo {
  margin-left: 10px;
}

.leader {
  text-align: left;
  margin-bottom: 20px;
}
</style>
