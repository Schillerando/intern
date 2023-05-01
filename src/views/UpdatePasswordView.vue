<template>
  <div>
    <!-- Update Password -->
    <div class="container">
      <div class="card p-4">
        <div class="card-body">
          <p class="text-muted">Lege dein neues Passwort fest</p>
          <form class="needs-validation" novalidate>
            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa fa-lock"></i></span>
              <input
                id="update-passwd"
                type="password"
                class="form-control"
                @input="validateUpdate(false)"
                placeholder="Password"
                required
              />

              <div class="invalid-feedback">
                Das Passwort muss mindestens 6 Zeichen lang sein
              </div>
            </div>
            <div class="input-group mb-3" id="login-passwd-group">
              <span class="input-group-text"
                ><i class="fa fa-arrow-rotate-left"></i
              ></span>
              <input
                id="validate-passwd"
                type="password"
                class="form-control"
                @input="validateUpdate(false)"
                placeholder="Bestätigen"
                required
              />

              <div class="invalid-feedback">
                Bitte gebe zwei mal das gleiche Passwort ein
              </div>
            </div>
            <div class="row">
              <div class="col-5">
                <button
                  type="button"
                  @click="validateUpdate(true)"
                  class="btn btn-primary px-4"
                  value="validate"
                >
                  Festlegen
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'UpdatePasswordView',
  data() {
    return {
      updatePressed: false,
    };
  },
  setup() {
    const form = reactive({
      password: '',
    });
    const store = useStore();
    return {
      store,
      form,
    };
  },
  methods: {
    validateUpdate(pressed) {
      if (!pressed && !this.updatePressed) return;

      var feedbacks = document.getElementsByClassName('invalid-feedback');
      Array.from(feedbacks).forEach((feedback) => {
        feedback.style.visibility = 'visible';
        feedback.style.position = 'relative';
      });

      var passwInput = document.getElementById('update-passwd');
      var valInput = document.getElementById('validate-passwd');
      valInput.value = valInput.value.replace(/\s/g, '');
      passwInput.value = passwInput.value.replace(/\s/g, '');
      var passwValid = false;
      var valValid = false;

      if (passwInput.value.length < 6) {
        passwInput.classList.remove('is-valid');
        passwInput.classList.add('is-invalid');
      } else {
        passwInput.classList.remove('is-invalid');
        passwInput.classList.add('is-valid');
        passwValid = true;
      }

      if (valInput.value != passwInput.value || !passwValid) {
        passwInput.classList.remove('is-valid');
        passwInput.classList.add('is-invalid');
      } else {
        passwInput.classList.remove('is-invalid');
        passwInput.classList.add('is-valid');
        valValid = true;
      }

      this.updatePressed = true;

      if (passwValid && valValid && pressed) this.updatePassword();
    },
    updatePassword() {
      var passwInput = document.getElementById('update-passwd');
      //var valInput = document.getElementById("validate-passwd");

      this.form.password = passwInput.value;

      this.store.dispatch('updatePasswordAction', this.form);
    },
  },
};
</script>

<style scoped>
.position {
  height: 500px;
}

.container {
  padding: 30px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
}

@media (max-width: 576px) {
  .container {
    position: relative;
    top: 0;
    left: 0;
    margin-right: 0;
    transform: translate(0, 0);
  }
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

.card {
  margin-bottom: 0.75rem;
  max-width: 500px;
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

.input-group {
  position: relative;
  display: flex;
  width: 100%;
}

.bg {
  background-color: #00a100;
}

.bg-sec {
  background-color: white;
  color: #00a100;
}

.btn-primary {
  background-color: #00a100;
  border-color: #00a100;
}

.btn-primary:hover {
  background-color: #007400;
  border-color: #007400;
}

.btn-link {
  color: #00a100;
}

.btn-link:hover {
  color: #007400;
}
</style>
