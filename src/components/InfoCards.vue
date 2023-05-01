<template>
  <section id="infos">
    <h2>Was bietet Schillerando?</h2>

    <div class="row">
      <div class="col col-lg-4 col-md-12 col-sm-12">
        <div class="card mb-4 rounded-3 shadow-sm">
          <div class="card-header py-3">
            <h4 class="info-title my-0 fw-normal">Für Kunden</h4>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mt-3 mb-4">
              <li class="info-text">
                Übersicht über alle Unternehmen, Angebote und Aktivitäten im
                Staat
              </li>
              <li class="info-text">Übersicht über alle Produkte</li>
              <li class="info-text">Preisvergleich</li>
              <li class="info-text">
                Bestellung und schnelle Lieferung von Produkten
              </li>
            </ul>
            <!-- <button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button> -->
          </div>
        </div>
      </div>
      <div class="col col-lg-4 col-md-12 col-sm-12">
        <div class="card mb-4 rounded-3 shadow-sm">
          <div class="card-header py-3">
            <h4 class="info-title my-0 fw-normal">Für Unternehmen</h4>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mt-3 mb-4">
              <li class="info-text">Registrierung beim Liefersystem</li>
              <li class="info-text">Einstellung aller Produkte und Preise</li>
              <li class="info-text">Werbung</li>
              <li class="info-text">Mehr Kunden erreichen</li>
              <li class="info-text">Extra Services</li>
            </ul>
            <!-- <button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button> -->
          </div>
        </div>
      </div>
      <div class="col col-lg-4 col-md-12 col-sm-12">
        <div class="card mb-4 rounded-3 shadow-sm">
          <div class="card-header py-3">
            <h4 class="info-title my-0 fw-normal">Für Arbeitnehmer</h4>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mt-3 mb-4">
              <li class="info-text">Flexible Mini-Jobs</li>
              <li class="info-text">Bezahlung pro Lieferung</li>
              <li class="info-text">Abwechslungsreiche und aktive Arbeit</li>
              <li class="info-text">Entspanntes Arbeitsumfeld</li>
              <li class="info-text">Rabatte</li>
            </ul>
            <!-- <button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button> -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 50px 20px 10px 20px;
}

.card {
  height: 90%;
}

.col {
  padding: 0 20px;
}

@media (max-device-width: 480px) {
  .info-text {
    padding-bottom: 30px;
  }
}
</style>
