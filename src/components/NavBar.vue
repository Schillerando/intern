<template>
  <hr />
  <header class="navbar navbar-expand-lg navbar-light sticky-top">
    <router-link to="/" class="brand navbar-brand">
      <img class="logo" src="@/assets/logo_transparent.png" />
      Business
    </router-link>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarToggler"
      aria-controls="navbarToggler"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarToggler">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <router-link class="nav-link" to="/buchhaltung">Buchhaltung</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/services">Services</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/produkte"
            >Produkte</router-link
          >
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/einstellungen">Einstellungen</router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://schillerando.de">
            <i class="fa-solid fa-shuffle mx-1"></i>
            Schillerando
          </a>
        </li>
        <div class="indicator" id="indicator"></div>
      </ul>
    </div>
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    info: String,
  },
  mounted() {
    /*
    const url = window.location.href.split('/');
    const path = url[url.length-1];
    const indicator = document.getElementById('indicator');
    const links = document.getElementsByClassName('nav-link');

    console.log(links[0].innerWidth);

    switch(path) {
      case "produkte":
        indicator.style.visibility = "visible";
        indicator.style.width = links[0].style.width + 'px'
        break;
      case "unternehmen":
        indicator.style.visibility = "visible";
        indicator.style.width = links[1].style.width + 'px'
        break;
      case "account":
        indicator.style.visibility = "visible";
        indicator.style.width = links[2].style.width + 'px'
        break;
      default:
        indicator.style.visibility = "hidden";
        break;
    }
    */
  },
  methods: {
    animateIndicator() {},
  },
};
</script>

<style scoped>
.navbar-toggler {
  margin-right: 10px;
}

.indicator {
  position: absolute;
  bottom: 20px;
  height: 4px;
  width: 100px;
  background-color: #00a100;
  visibility: hidden;
}

.navbar {
  -webkit-box-shadow: 0 8px 6px -6px #b1afaf;
  -moz-box-shadow: 0 8px 6px -6px #b1afaf;
  box-shadow: 0 8px 6px -6px #b1afaf;

  margin: 0 -10px;
  padding: 12px 20px;
  text-align: left;
  background-color: white;

  z-index: 999;
}

.navbar-brand {
  font-size: 1.5rem;
  color: #00a100;
  font-weight: 900;
  position: relative;
  top: 5px;
}

.navbar-brand:hover {
  color: #00a100;
}

.nav-item {
  padding: 0 18px;
}

.nav-link:hover {
  color: #00a100;
}

.nav-link {
  font-size: 1.2em;
  color: #000;
}

.logo {
  height: 40px;
  padding: 0 10px;
  position: relative;
  bottom: 5px;
}

@media (max-width: 991px) {
  .indicator {
    height: 0px;
  }

  label {
    position: static;
  }

  br {
    content: '';
  }
}
</style>
