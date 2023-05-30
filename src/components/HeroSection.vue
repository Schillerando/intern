<template>
  <section id="title">
    <div class="row">
      <div class="col-md-6 col-12 order-first order-md-last">
        <img class="hero-image" src="@/assets/hero_image.png" alt="" />
      </div>
      <div class="col-md-6 col-12">
        <div class="hero-info">
          <div class="title">
            <span>Mehr </span>
            <span style="color: black">als ein</span>
            <br />
            <span>Lieferservice</span>
          </div>
          <p class="text">
            Registriere dein Unternehmen <br />
            um von zahlreichen Services <br />
            zu profitieren
          </p>
          <button
            @click="$router.push('/companyRegistration')"
            class="btn btn-primary"
          >
            Registrieren
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      businessUrl: process.env.VUE_APP_BUSINESS_URL,
    };
  },
};
</script>

<style scoped>
/* Desktop */
section {
  margin: 3% 2% 3% 2%;
  background-color: #fff;
  text-align: left;
  font-family: 'Inter', sans-serif;
  position: relative;
}

@media (min-width: 1400px) {
  .col-md-6 {
    zoom: 120%;
  }
}

@media (min-width: 2000px) {
  .col-md-6 {
    margin-top: 3%;
    zoom: 150%;
  }
}

.title {
  font-size: 4.5rem;
  color: #00a100;
  font-weight: bold;
  line-height: 5rem;
}

.text {
  font-size: 1.8rem;
  margin-top: 10px;
  line-height: 2.3rem;
  font-weight: medium;
}

.row {
  margin: 2% 5% 0 5%;
  padding-bottom: 0;
}

.btn {
  font-size: 2rem;
  font-weight: 400;
  margin-top: 30px;
  padding: 5px 40px;
  font-weight: medium;
  border-radius: 0.5rem;
  display: block;
}

p {
  display: inline-block;
}

.hero-info {
  position: relative;
  margin: 35px auto;
  width: max-content;
}

img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  height: 80%;
}

@media (max-width: 767px) {
  img {
    width: 80%;
    height: auto;
  }

  section {
    text-align: center;
    margin-bottom: 50px;
  }

  .title {
    font-size: 2.5rem;
    line-height: 3rem;
  }

  .text {
    font-size: 1.2rem;
    line-height: 1.5rem;
  }

  .btn {
    font-size: 1.5rem;
    font-weight: 600;
    padding: 3px 20px;
    position: relative;
    margin: 30px auto;
  }
}

/* Small Tablet */
@media (min-width: 768px) {
  section {
    margin: 3% 0 0 0;
  }

  .row {
    height: 450px;
  }

  .hero-info {
    margin-top: 5px;
  }

  .title {
    font-size: 2.5rem;
    line-height: 2.8rem;
  }

  .text {
    font-size: 1.2rem;
    line-height: 1.6rem;
  }

  .btn {
    margin-top: 20px;
    font-size: 1.5rem;
    padding: 3px 30px;
  }

  img {
    height: 50%;
  }
}

/* Tablet */
@media (min-width: 870px) {
  section {
    margin: 3% 2% 0 0;
  }

  .row {
    height: unset;
  }

  .hero-info {
    margin: 35px auto;
  }

  .title {
    font-size: 3rem;
    line-height: 3.5rem;
  }

  .text {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .btn {
    font-size: 1.8rem;
  }

  img {
    height: 70%;
  }
}

/* Pc */
@media (min-width: 1270px) {
  section {
    margin: 3% 2% 3% 2%;
  }

  .row {
    height: unset;
  }

  .hero-info {
    margin: 35px auto;
  }

  .title {
    font-size: 4.5rem;
    line-height: 5rem;
  }

  .text {
    font-size: 1.8rem;
    line-height: 2.3rem;
  }

  .btn {
    font-size: 2rem;
  }

  img {
    height: 80%;
  }
}
</style>
