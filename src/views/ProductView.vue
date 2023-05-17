<template>
  <TitleDiv title="Produkte" />
  <div v-if="products.length > 0">
    <div class="list">
      <div v-for="ssItem in products" v-bind:key="ssItem.id">
        <ProductTile :data="ssItem" class="item"></ProductTile>
      </div>
      <div v-for="index in 2" :key="index" class="item"></div>
    </div>

  </div>

</template>

<script>
import { supabase } from '@/supabase';
import TitleDiv from '../components/TitleDiv';
import ProductTile from '../components/ProductTile';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProductView',
  components: {
    TitleDiv,
    ProductTile
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
    };
  },
  async created() {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('company_id', this.companyData.id);

    if (error) throw error;
    this.products = data;
  },
};
</script>

<style scoped>
.list {
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}
</style>
