<template>
  <TitleDiv title="Unternehmen" />

  <div class="mb-4" v-if="notVerfiedCompanies.length > 0">
    <h3 class="mb-2">
      Not verified Companies
    </h3>
    <div class="list">
      <div v-for="ssItem in notVerfiedCompanies" v-bind:key="ssItem.id">
        <CompanyTile :data="ssItem" class="item"></CompanyTile>
      </div>
      <div v-for="index in 2" :key="index" class="item"></div>
    </div>
  </div>

  <div class="mb-4 mt-4" v-if="noAboCompanies.length > 0">
    <h3 class="mb-2">
    Companies without an abo
  </h3>
  <div class="list">
    <div v-for="ssItem in noAboCompanies" v-bind:key="ssItem.id">
      <CompanyTile :data="ssItem" class="item"></CompanyTile>
    </div>
    <div v-for="index in 2" :key="index" class="item"></div>
  </div>
  </div>

  <CompanySortableList v-if="companies.length > 0" :items="companies" :loading="loading" element="CompanyTile" />
  <div
    v-if="loading"
    class="spinner-border"
    style="width: 4rem; height: 4rem; border-width: 7px"
    role="status"
  >
    <span class="visually-hidden">Loading...</span>
  </div>
</template>

<script>
import CompanySortableList from '@/components/CompanySortableList.vue';
import { supabase } from '@/supabase';
import TitleDiv from '../components/TitleDiv';
import CompanyTile from '../components/CompanyTile';

export default {
  name: 'CompanyView',
  components: {
    TitleDiv,
    CompanySortableList,
    CompanyTile
  },
  data() {
    return {
      companies: [],
      notVerfiedCompanies: [],
      noAboCompanies: [],
      loading: true,
    };
  },
  async created() {
    const { data, error } = await supabase
      .from('companies')
      .select()

    if (error != null) console.log(error);
    
    data.forEach(company => {
      if(company.abo == null) this.noAboCompanies.push(company)
      else if(company.verified != true) this.notVerfiedCompanies.push(company)
      else this.companies.push(company)
    })

    this.loading = false;
  },
};
</script>

<style>
.spinner-border {
  color: #00a100;
}

.list {
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
}
</style>
