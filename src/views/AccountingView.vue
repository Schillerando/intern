<template>
  <EditAccountingEntryOverlay v-if="newEntry" :products="products" @stopEditingEntry="stopEditingEntry($event)" @deleteEntry="deleteEntry()"/>

  <div style="width: 100vw;">
    <TitleDiv title="Buchhaltung" />
  <button class="btn btn-primary mb-4 add-product" @click="addEntry()">
    Eintrag hinzufügen
  </button>

  <div class="row">

    <div class="col-12">

    </div>
    
    <div class="col-lg-6">
      <div class="card m-1">
        <div class="card-body">
          
        </div>
      </div>
    </div>
  
    <div class="col-lg-6">
      <div class="entries">
        <SortableList
          v-if="entries.length > 0"
          :items="entries"
          :products="products"
          :key="key"
          element="AccountingEntryTile"
          @deleteEntry="deleteEntry($event)"
        />

        <!--
        <div v-if="entries.length > 0">
          <div class="list">
            <div v-for="ssItem in entries" v-bind:key="ssItem.id">
              <AccountingEntryTile :data="ssItem" :products="products" @deleteEntry="deleteEntry($event)"></AccountingEntryTile>
            </div>
            <div v-for="index in 2" :key="index"></div>
          </div>
        </div>
        -->
      </div>
        
    </div>

  </div>
  </div>
  
  

</template>

<script>
import TitleDiv from '../components/TitleDiv';
import EditAccountingEntryOverlay from '../components/EditAccountingEntryOverlay';
import SortableList from '@/components/SortableList.vue';
import { supabase } from '@/supabase';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AccountingView',
  components: {
    TitleDiv,   
    EditAccountingEntryOverlay,
    SortableList, 
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
      entries: [],
      products: [],
      expenses: null,
      revenue: null,
      profit: null,
      newEntry: false,
      key: 0
    };
  },
  async created() {
    {
      const { data, error } = await supabase
      .from('products')
      .select()
      .eq('company_id', this.companyData.id);

      if (error) throw error;
      this.products = data.sort((a, b) => a.name.localeCompare(b.name));
    }

    const { data, error } = await supabase
      .from('accounting')
      .select()
      .eq('company_id', this.companyData.id);

    if (error) throw error;

    this.entries = data.sort((a, b) => a.created_at > b.created_at);
    
    this.calculateExpenses()
    this.calculateRevenue()
    this.calculateProfit()
    
  },
  methods: {
    deleteEntry(entryData) {
      this.newEntry = false;

      var index = this.entries.findIndex(item => item.id == entryData.id)
      this.entries.splice(index, 1)

      this.key++;

      this.store.dispatch('deleteEntry', entryData)
    }, 
    stopEditingEntry(entryData) {
      this.newEntry = false;

      if(entryData != null) {
        this.entries.push(entryData);
      }

      this.key++;

      this.calculateExpenses()
      this.calculateRevenue()
    },
    addEntry() {
      this.newEntry = true;
    },
    calculateExpenses() {


      this.calculateProfit()
    },
    calculateRevenue() {


      this.calculateProfit()
    },
    calculateProfit() {
      if(this.expenses == null || this.revenue == null)  return;

      this.profit = this.revenue - this.expenses;
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


.card {
  margin: 10px 0;
  width: 100%;
  padding: 10px 0;
}

.row {
  padding: 0;
  width: 90%;
  margin: 0 auto;
}
.entries {
  padding: 30px 0;
  width: 100%;
}

</style>
