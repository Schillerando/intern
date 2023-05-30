<template>
  <div class="feature col">
    <div class="feature-icon">
      <img :src="getImgUrl(image)" alt="" />
    </div>
    <h2 style="color: #00a100">{{ title }}</h2>
    <p>
      {{ text }}
    </p>
    <a
      v-if="link"
      :href="link"
      class="icon-link"
      style="text-decoration: underline"
    >
      {{ linkTitle }}
      <i style="margin-left: 5px" class="fa-solid fa-arrow-right"></i>
    </a>
  </div>
</template>

<script>
export default {
  name: 'CompanyTile',
  props: [
    'left',
    'forCompanies',
    'title',
    'image',
    'text',
    'link',
    'linkTitle',
  ],
  methods: {
    getImgUrl(image) {
      var images = require.context('../assets/', false);
      return images('./' + image);
    },
  },
};
</script>

<style scoped>
.feature {
  padding: 10px 30px;
  margin: 0 auto 50px auto;
  max-width: 500px;
}

p {
  font-size: 1.2rem;
}

img {
  padding: 10px 10px 20px 10px;
  width: 140px;
}
</style>
