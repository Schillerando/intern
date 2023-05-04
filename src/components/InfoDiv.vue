<template>
  <div class="container-fluid">
    <p>{{ info }}</p>
  </div>
</template>

<script>
export default {
  name: 'InfoDiv',
  props: {
    info: String,
  },
};
</script>

<style scoped>
div {
  background-color: white;
  padding: 50px 40px;
}

p {
  font-size: 1.5rem;
}

@media (max-device-width: 480px) {
  p {
    font-size: 1.5rem;
  }
}
</style>
