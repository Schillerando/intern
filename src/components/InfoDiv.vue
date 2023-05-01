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
  color: #00a100;
  background-color: white;
  padding: 50px 20px;
}

p {
  font-size: 2rem;
}

@media (max-device-width: 480px) {
  p {
    font-size: 1.5rem;
  }
}
</style>
