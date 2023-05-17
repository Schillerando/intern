<template>
  <div class="card">
    <div class="image">
      <div v-if="this.data.image == null" class="no-image">
        <i class="fa-solid fa-image fa-2xl"></i>
        {{ this.data.image }}
      </div>
      <img v-else :src="this.image" alt="" />
    </div>
    <div class="info">
      <div>
        <p class="name">{{ data.name }}</p>
        <p class="category">{{ data.categories[0] }}</p>

      </div>

      <p class="price">{{ data.price }} $</p>

    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
  name: 'ProductTile',
  props: ['data'],
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
};
</script>

<style scoped>
.price,
.name {
  font-size: 1.25rem;
  padding: 0;
  margin: 0;
  font-weight: 600;
}

.btn {
  position: absolute;
  bottom: 8px;
  right: 10px;
  padding: 3px 11px 3px 9px;
}

.name {
  text-align: left;
  margin: 10px 0 0 15px;
}

.company_name {
  text-align: left;
  margin-left: 15px;
  font-weight: 300;
}

.price {
  position: absolute;
  text-align: left;
  bottom: 8px;
  left: 15px;
  color: black;
}

.row {
  position: absolute;
  width: 100%;
  bottom: 0;
}

.row,
.col {
  margin: 0;
  padding: 0;
}

.info {
  position: absolute;
  width: 60%;
  height: 100%;
  top: 0;
  left: 40%;
}

.card {
  flex-direction: row;
  overflow: hidden;
  margin: 2.5%;
}

.image {
  width: 40%;
  position: relative;
  padding-bottom: 40%;
  margin-right: 10px;
  border-right: 1px solid;
  border-color: #cfd4da;
}

.no-image {
  background-color: gray;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: scale-down;
}

.category {
  text-align: left;
  margin-top: -10px;
  font-weight: 300;
  margin: -10px 0 0 15px;
}

.btn-primary {
  background-color: #00a100;
  border-color: #00a100;
}

.btn-primary:hover {
  background-color: #007400;
  border-color: #007400;
}

.fa-image {
  position: absolute;
  font-size: 4rem;
  top: 50%;
  left: calc(50% - 2rem);
  color: black;
}

/*   border-radius: 0.375rem 0 0 0.375rem; */
</style>
