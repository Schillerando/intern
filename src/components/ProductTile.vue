<template>
  <div class="card">
    <div class="image">
      <div v-if="data.product_picture == null" class="no-image"></div>
      <img v-else src="@/assets/cola.png" alt="" />
    </div>
    <div class="info">
      <div>
        <p class="name">{{ data.name }}</p>
      </div>
      <div>
        <p class="company_name">{{ data.company_name }}</p>
      </div>

      <p class="price">{{ data.price }} $</p>

      <button class="btn btn-primary" @click="addProductToCart">
        <i class="fa-solid fa-cart-plus fa-lg"></i>
      </button>
    </div>
  </div>
</template>

<script>
import router from '@/router';
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
  methods: {
    addProductToCart() {
      if (this.store.getters.getUser == null)
        router.push({ path: 'auth', query: { redirect: 'produkte' } });
      this.store.commit('addProductToCart', this.data);
    },
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

/*   border-radius: 0.375rem 0 0 0.375rem; */
</style>
