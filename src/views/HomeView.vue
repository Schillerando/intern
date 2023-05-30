<template>
  <HeroSection />

  <FeatureSection />

  <QuestionsCarousel />
</template>

<script>
import HeroSection from '../components/HeroSection';
import QuestionsCarousel from '../components/QuestionsCarousel';
import FeatureSection from '../components/FeatureSection';

export default {
  name: 'HomeView',
  components: {
    HeroSection,
    QuestionsCarousel,
    FeatureSection,
  },
  data() {
    return {};
  },
};
</script>
