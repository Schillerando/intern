<template>
  <section id="questions">
    <div class="container-fluid">
      <div class="row mx-auto my-auto">
        <div
          id="question-carousel"
          class="carousel slide carousel-dark"
          data-bs-ride="carousel"
        >
          <div class="carousel-inner">
            <div class="question carousel-item active" data-bs-interval="4000">
              <h3 class="question-text">
                Du hast keinen Überblick über die zahlreichen Angebote bei
                Schule als Staat?
              </h3>
            </div>
            <div class="question carousel-item" data-bs-interval="4000">
              <h3 class="question-text">
                Du hast keine Zeit dir Essen oder Trinken zu kaufen weil du
                selber arbeiten musst?
              </h3>
            </div>
            <div class="question carousel-item" data-bs-interval="4000">
              <h3 class="question-text">
                Du willst Werbung für dein Unternehmen um mehr Kunden zu
                gewinnen?
              </h3>
            </div>
            <div class="question carousel-item" data-bs-interval="4000">
              <h3 class="question-text">
                Du bist Arbeitslos und willst schnelles Geld verdienen?
              </h3>
            </div>
            <div class="question carousel-item" data-bs-interval="4000">
              <h3 class="question-text">
                Du willst einen flexiblen Job ohne feste Arbeitszeiten und
                tristes Rumsitzen?
              </h3>
            </div>
          </div>
        </div>
      </div>

      <h2 class="answer">Schillerando.</h2>
    </div>
  </section>
</template>

<style scoped>
section {
  background-color: #00a100;
  padding: 40px 0 50px 0;
}

.question {
  color: white;
}

.answer {
  color: #00a100;
  background-color: #fff;
  width: fit-content;
  margin: 30px auto;
  padding: 5px 5px 2px 5px;
}
</style>
