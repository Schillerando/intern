<template>
  <div class="wrapper" v-if="verified || premium">
    <div  class="container_row">
      <i
        class="layer1 fa-solid fa-certificate fa-xl"
        :style="{ color: [premium ? '#f6b600' : '#3798f0'] }"
      ></i>
      <i v-if="premium" class="layer2 fa-solid fa-crown fa-xs"></i>
      <i v-else class="layer2 fa-solid fa-check fa-sm"></i>
    </div>
  </div>  
  
</template>

<script>
import { Popover } from 'bootstrap/dist/js/bootstrap.bundle.js';

export default {
  name: 'CompanyBadge',
  props: {
    verified: Boolean,
    premium: Boolean,
  },
  mounted() {
    Array.from(
      document.querySelectorAll('a[data-bs-toggle="popover"]')
    ).forEach((popoverNode) => new Popover(popoverNode, { html: true }));
  },
};
</script>

<style scoped>
.wrapper {
  display: inline-block;
}

.container_row {
  display: grid;
  height: 25px;
}

.layer1,
.layer2 {
  grid-column: 1;
  grid-row: 1;
  position: relative;
  margin: auto;
}

.layer2 {
  color: #ffffff;
}
</style>
