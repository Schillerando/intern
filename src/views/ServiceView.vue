<template>
  <TitleDiv title="Services" />

  <div v-if="drivers.length > 0 && this.newServices.length > 0">
    <h3>Neue Services</h3>
    <div class="list">
      <div v-for="service in this.newServices" :key="service.id">
        <ServiceTile :data="service" :drivers="drivers"></ServiceTile>
      </div>
    </div>
  </div>

  <div v-if="drivers.length > 0 && this.oldServices.length > 0">
    <h3>Alte Services</h3>
    <div class="list">
      <div v-for="service in this.oldServices" :key="service.id">
        <ServiceTile :data="service" :drivers="drivers"></ServiceTile>
      </div>
    </div>
    
  </div>
</template>

<script>
import TitleDiv from '@/components/TitleDiv.vue';
import ServiceTile from '@/components/ServiceTile.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { supabase } from '@/supabase';

export default {
  name: 'ServiceView',
  components: {
    TitleDiv,
    ServiceTile
  },
  setup() {
    const store = useStore();

    const newServices = computed(() => {
      var services = store.state.services
      services = services.filter(service => (service.finished == false))
      services.sort((a, b) => (a.date + a.booked_time).localeCompare((b.date + b.booked_time)))
      return services
    })

    const oldServices = computed(() => {
      var services = store.state.services
      services = services.filter(service => (service.finished == true))
      services.sort((a, b) => (a.date + a.booked_time).localeCompare((b.date + b.booked_time)))
      return services
    })

    return {
      store,
      newServices,
      oldServices
    }
  },
  data() {
    return {
      drivers: []
    };
  },
  async mounted() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select()

      if(error != null) throw error

      this.drivers = data
    } catch(e) {
      console.log(e)
    }
  }
};
</script>

<style scoped>
h3 {
  margin-bottom: 20px;
}

div {
  margin-bottom: 40px;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}
</style>
