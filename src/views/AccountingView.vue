<template>
  <AlertBanner title="Coming Soon"/>
  <TitleDiv title="Buchhaltung" />
  <InfoDiv info="Hier kannst du in Zukunft die Buchhaltung deines Unternehems führen. Du kannst Lohnausgaben, Umsätze durch Verkäufe, Ausgaben für Warenbeschaffung, Ausgaben für Miete und sonstige Einnahmen und Ausgaben eintragen. Außerdem werden deine Einnahmen durch Verkäufe auf Schillerando automatisch mit einberechnet. Du erhälst eine genaue Übersicht über deine Ausgaben und Einnahmen und über deinen Gewinn oder Verlust insgesamt. Alle Beträge werden automatisch zwischen Staatswährung und Euro umgerechnet, sodass du zum Beispiel Ausgaben im Ausland einfach in Euro eingeben kannst und dir keine Gedanken über den Wechselkurs machen musst."/>

</template>

<script>
import TitleDiv from '../components/TitleDiv';
import InfoDiv from '../components/InfoDiv';
import AlertBanner from '../components/AlertBanner';

export default {
  name: 'AccountingView',
  components: {
    TitleDiv,
    AlertBanner,
    InfoDiv
  },
  data() {
    return {};
  },
};
</script>
