<template>
  <EditProductOverlay v-if="newProduct" :registration="false" @stopEditingProduct="stopEditingProduct($event)" @deleteProduct="deleteProduct()"/>

  <TitleDiv title="Angebote" />
  <button class="btn btn-primary mb-4 add-product" @click="addProduct()">
    Angebot hinzufügen
  </button>

  <SortableList
      v-if="!loading && products.length > 0"
      :items="products"
      :key="key"
      sort-by-categories="true"
      element="ProductTile"
      @deleteProduct="deleteProduct($event)"
    />
    <!--
  <div v-for="ssItem in products" v-bind:key="ssItem.id">
    <ProductTile :data="ssItem" @deleteProduct="deleteProduct($event)"></ProductTile>
  </div>
  
  <div v-for="index in 2" :key="index"></div>
  -->

</template>

<script>
import { supabase } from '@/supabase';
import TitleDiv from '@/shared//components/TitleDiv';
//import ProductTile from '../components/ProductTile';
import EditProductOverlay from '../components/EditProductOverlay';
import SortableList from '@/components/SortableList.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProductView',
  components: {
    TitleDiv,
    //ProductTile,
    EditProductOverlay,
    SortableList
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
      newProduct: false, 
      key: 0,
      loading: true
    };

  },
  async created() {
    try {

      const { data, error } = await supabase
        .from('products')
        .select()
        .eq('company_id', this.companyData.id);

      if (error) throw error;
      this.products = data.sort((a, b) => a.name.localeCompare(b.name));

      for(var i=0; i<this.products.length; i++) {

        if(this.products[i].has_variations) {

          const { data, error } = await supabase
            .from('product_variations')
            .select()
            .eq('product', this.products[i].id)
            .order('price')

          if(error) throw error

          if(data.length > 0) this.products[i].variations = data

        }

        if(this.products[i].has_extras) {

          const { data, error } = await supabase
            .from('product_extras')
            .select()
            .eq('product', this.products[i].id)
            .order('extra_price')

          if(error) throw error

          if(data.length > 0) this.products[i].extras = data

        }

      }

      this.loading = false

      console.log(this.products)
    } catch(e) {
      console.log(e)
    }
    
  },
  methods: {
    deleteProduct(productData) {
      this.newProduct = false;

      console.log('test');

      var index = this.products.findIndex(item => item.id == productData.id)
      this.products.splice(index, 1)

      this.key++;

      this.store.dispatch('deleteProduct', productData)
    }, 
    stopEditingProduct(productData) {
      this.newProduct = false;

      console.log('test');

      if(productData != null) {
        this.products.push(productData);
        this.key++;
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
