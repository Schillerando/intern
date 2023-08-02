<template>
  <EditAccountingEntryOverlay v-if="newEntry" :products="products" @stopEditingEntry="stopEditingEntry($event)" @deleteEntry="deleteEntry()"/>

  <div style="width: 100vw;">
    <TitleDiv title="Buchhaltung" />

    <p style="margin-bottom: 20px; margin-top: -20px">
      $ <span style="font-size: 1.3rem">&#8793;</span> Schilli (1$ = 0.1€)
    </p>

    <button class="btn btn-primary mb-4 add-product" @click="addEntry()">
      Eintrag hinzufügen
    </button>

    <div class="row">

      <div class="col-12 total-numbers">

        <div class="row table">

          <div class="col-lg-4 equal">
            <div class="card">
              <div class="card-body">
                <div class="profit" :class="{ revenue: profit > 0, expenses: profit < 0 }">
                  <h3>Gewinn / Verlust</h3>
                  <h1>{{ profit }} $</h1>
                  <div class="euroProfit">{{ euroProfit }} €</div> 

                  <a id="tooltip" v-if="profit > 0" tabindex="0" data-bs-toggle="tooltip" data-bs-placement="top" title="mit 20% Umtauschsteuer">
                    <i class="fa-regular fa-circle-question fa-lg"></i>
                  </a>      

                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 equal">
            <div class="card">
              <div class="card-body">
                <div class="revenue">
                  <h3>Einnahmen</h3>
                  <h1>{{ revenue }} $</h1>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 equal">
            <div class="card">
              <div class="card-body">
                <div class="expenses">
                  <h3>Ausgaben</h3>
                  <h1>{{ expenses }} $</h1>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
      
      <div class="col-lg-6">
        
        <div class="canvas">
          <canvas id="total-chart"></canvas>
        </div>

      </div>
    
      <div class="col-lg-6">
        <div class="entries">
          <SortableList
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
// eslint-disable-next-line no-unused-vars
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js/auto'

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
  mounted() {
    window.jQuery = window.$ = require('jquery');

    window.Popper = require('@popperjs/core');

    require('bootstrap');

    window.$('body').tooltip({
        selector: '[data-bs-toggle="tooltip"]',
    });
  },  
  data() {
    return {
      entries: [],
      products: [],
      expenses: 0,
      revenue: 0,
      profit: 0,
      euroProfit: 0,
      newEntry: false,
      key: 0,
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
    
    this.calculateProfit()
    this.updateTotalGraph()
    
  },
  methods: {
    deleteEntry(entryData) {
      this.newEntry = false;

      var index = this.entries.findIndex(item => item.id == entryData.id)
      this.entries.splice(index, 1)

      this.key++;

      this.store.dispatch('deleteEntry', entryData)

      this.calculateProfit()
      this.updateTotalGraph()
    }, 
    stopEditingEntry(entryData) {
      this.newEntry = false;

      if(entryData != null) {
        this.entries.push(entryData);
      }

      this.key++;

      this.calculateProfit()
      this.updateTotalGraph()
    },
    addEntry() {
      this.newEntry = true;
    },
    calculateProfit() {
      this.revenue = 0
      this.expenses = 0

      this.entries.forEach(entry => {
        if(entry.amount > 0) {
          this.revenue += entry.amount
        } else {
          this.expenses += Math.abs(entry.amount)
        }
      })

      this.profit = this.revenue - this.expenses;
      this.euroProfit = this.profit > 0 ? this.profit * 0.08 : this.profit * 0.1
    },
    updateTotalGraph() {
      const revenueChart = {
        type: 'bar',
        label: 'Einnahmen',
        data: [],
        backgroundColor:"rgba(0, 128, 0, 0.2)",
        borderColor: "rgba(0, 128, 0, 1)",
        order: 2,
        borderSkipped: false,
        borderWidth: 1
      }

      const expensesChart = {
        type: 'bar',
        label: 'Ausgaben',
        data: [],
        backgroundColor:"rgba(255, 0, 0, 0.2)",
        borderColor: "rgba(255, 0, 0, 1)",
        order: 3,
        borderSkipped: false,
        borderWidth: 1
      }

      const profitChart = {
        type: 'line',
        label: 'Gewinn / Verlust',
        data: [],
        backgroundColor:"rgba(13, 110, 253, 0.2)",
        borderColor: "rgba(13, 110, 253, 1)",
        order: 1,
      }

      const labels = []

      this.entries.forEach(entry => {

        var index;

        if(labels.includes(entry.created_at.split('T')[0])) {
          index = labels.indexOf(entry.created_at.split('T')[0])

        } else {
          labels.push(entry.created_at.split('T')[0])

          index = labels.length - 1

          revenueChart.data.push(0)
          expensesChart.data.push(0)
          if(index == 0) profitChart.data.push(0)
          else profitChart.data[index] = profitChart.data[index-1]
        }

        if(entry.amount > 0) {
            revenueChart.data[index] += entry.amount;
          } else {
            expensesChart.data[index] += entry.amount;
          }

          profitChart.data[index] += entry.amount;

      })

      console.log(labels)
      console.log(profitChart)

      const ctx = document.getElementById('total-chart');
      new ChartJS(ctx, {
        data: {
          labels: labels,
          datasets: [
            revenueChart,
            expensesChart,
            profitChart
          ]
        },
        options: {
          scales: {
            x: {
              stacked: true
            },
            y: {
              beginAtZero: false,
            }
          },
          responsive: true,
        }
      });
    }
  }
};
</script>

<style scoped>

h1 {
  font-weight: 600;
  font-size: 2.5rem;
  height: 2.7rem;
  overflow: hidden;
}

h3 {
  font-weight: 400;
  color: black;
  margin-bottom: 20px;
}

.list {
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10px, 1fr));
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

.equal {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.entries {
  padding: 30px 0;
  width: 100%;
}

.revenue {
  color: green;
}

.expenses {
  color: red;
}

.euroProfit {
  font-size: 1.4rem;
  display: inline;
  margin-right: 10px;
}

.fa-circle-question {
  color: #0d6efd;
}

#tooltip {
  position: relative;
  bottom: 2px;
}

.total-numbers {
  margin-bottom: 50px;
}

#total-chart {
  width: 100%;
}

</style>
