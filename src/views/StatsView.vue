<template>
  <div class="wrapper">
    <TitleDiv title="Statistiken"></TitleDiv>

    <div v-if="!loading" class="stats">
      <div class="list">
        <div class="card">
          <h3>Nutzer</h3>
          <p class="count">{{ userCount }}</p>
        </div>  
        <div class="card">
          <h3>Unternehmen</h3>
          <p class="count">{{ companyCount }}</p>
        </div>
        <div class="card">
          <h3>Angebote</h3>
          <p class="count">{{ productCount }}</p> 
        </div>
        <div class="card">
          <h3>Bestellungen</h3>
          <p class="count">{{ orderCount }}</p>
        </div>
      </div>

      <TitleDiv title="Links"></TitleDiv>

      <div class="list">
        <div v-for="link in links" :key="link.id">
          <div class="card">
            <h4 class="name">{{ link.name }}</h4>
            <p class="count">{{ link.count }}</p>
          </div>  
        </div>
      </div>
      
    </div>
    
  </div>  
  
</template>

<script>
import TitleDiv from '@/shared/components/TitleDiv.vue';
import { supabase } from '@/supabase';

export default {
  name: 'StatsView',
  components: {
    TitleDiv
  },
  data() {
    return {
      loading: true,
      userCount: 0,
      companyCount: 0,
      productCount: 0,
      orderCount: 0,
      links: []
    };
  },
  async mounted() {
    require.context('../assets/', false);

    try {

      {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        if(error) throw error;

        this.userCount = count
      }

      {
        const { count, error } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true})
          .eq('verified', true)

        if(error) throw error;

        this.companyCount = count
      }

      {
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true})
          .eq('public', true)

        if(error) throw error;

        this.productCount = count
      }

      {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true})

        if(error) throw error;

        this.orderCount = count
      }

      {
        const { data, error } = await supabase
          .from('stats')
          .select('*')

        if(error) throw error;

        this.links = data

        this.links = this.links.filter((link) => link.id != 0)
        this.links.sort((a, b) => a.id < b.id)
      }
      
      this.loading = false
    } catch (e) {
      console.log(e)
    }

  }
};
</script>

<style scoped>
h3 {
  font-size: 1.8rem;
}

.card {
  padding: 20px 20px 0 20px;
  margin: 10px 20px;
}

.count {
  font-size: 2rem;
  font-weight: 400;
}

.list {
  position: relative;
  text-align: center;
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.name {
  height: 80px;
}
</style>
