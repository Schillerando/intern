<template>
  <EditProductOverlay v-if="newProduct" :registration="false" @stopEditingProduct="stopEditingProduct($event)" @deleteProduct="deleteProduct()"/>

  <TitleDiv title="Produkte" />
  <button class="btn btn-primary mb-4 add-product" @click="addProduct()">
    Produkt hinzufügen
  </button>
  <div v-if="products.length > 0">
    <div class="list">
      <div v-for="ssItem in products" v-bind:key="ssItem.id">
        <ProductTile :data="ssItem" @deleteProduct="deleteProduct($event)"></ProductTile>
      </div>
      <div v-for="index in 2" :key="index"></div>
    </div>

  </div>

</template>

<script>
import { supabase } from '@/supabase';
import TitleDiv from '../components/TitleDiv';
import ProductTile from '../components/ProductTile';
import EditProductOverlay from '../components/EditProductOverlay';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProductView',
  components: {
    TitleDiv,
    ProductTile,
    EditProductOverlay
  },
  setup() {
    const store = useStore();

    const companyData = computed(() => store.state.userCompany);

    return {
      store,
      companyData
    }
  },
  data() {
    return {
      products: [],
      newProduct: false
    };
  },
  async created() {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('company_id', this.companyData.id);

    if (error) throw error;
    this.products = data.sort((a, b) => a.name.localeCompare(b.name));
  },
  methods: {
    deleteProduct(productData) {
      this.newProduct = false;

      var index = this.products.findIndex(item => item.id == productData.id)
      this.products.splice(index, 1)

      this.store.dispatch('deleteProduct', productData)
    }, 
    stopEditingProduct(productData) {
      this.newProduct = false;

      if(productData != null) {
        this.products.push(productData);
      }
    },
    addProduct() {
      this.newProduct = true;
    }
  }
};
</script>

<style scoped>
.list {
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

.add-product {
  font-size: 1.25rem;
}
</style>
