<template>
  <TitleDiv title="Produkte" />
</template>

<script>
import { supabase } from '@/supabase';
import TitleDiv from '../components/TitleDiv';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProductView',
  components: {
    TitleDiv,
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
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select()
        .eq('company_id', this.companyData.id);

      if (error) throw error;
      this.products = data;
    },
  }
};
</script>
