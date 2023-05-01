<template>
  <div class="row">
    <div class="col-md-3 col-xl-4"></div>
    <div class="search-comp col-12 col-md-6 col-xl-4">
      <input
        class="search form-control form-control-lg me-2"
        type="search"
        placeholder="Suchen..."
        aria-label="Suchen..."
        v-model="searchString"
      />
    </div>
    <div class="col-md-3 col-xl-4"></div>
    <div class="col-md-3 col-xl-4"></div>

    <div class="col-12 col-md-6 col-xl-4">
      <div class="settings">
        <button
          class="direction btn btn-outline-secondary"
          @click="[dir == 'up' ? (dir = 'down') : (dir = 'up')]"
        >
          <i v-if="dir == 'up'" class="fa-solid fa-arrow-down fa-lg"></i>
          <i v-else class="fa-solid fa-arrow-up fa-lg"></i>
        </button>
        <select
          v-if="element == 'CompanyTile'"
          @change="companyCategoryChange"
          id="companyCategory"
          class="form-select form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="" selected>Kategorie</option>
          <option value="Gastronomie">Gastronomie</option>
          <option value="Kultur">Kultur</option>
          <option value="Dienstleistung">Dienstleistung</option>
          <option value="Gastronomie & Dienstleistung">
            Gastronomie & Dienstleistung
          </option>
        </select>
        <select
          v-else
          @change="productCategoryChange"
          id="productCategory"
          class="form-select form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="" selected>Kategorie</option>
          <option value="Essen">Essen</option>
          <option value="Trinken">Trinken</option>
          <option value="Gegenstand">Gegenstand</option>
          <option value="Dienstleistung">Dienstleistung</option>
        </select>
        <select
          v-if="element == 'CompanyTile'"
          @change="companySortChange"
          id="companySort"
          class="form-select form-select-right form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="relevance" selected>Sortieren</option>
          <option value="relevance">Relevanz</option>
          <option value="review">Bewertung</option>
          <option value="name">Name</option>
        </select>
        <select
          v-else
          @change="productSortChange"
          id="productSort"
          class="form-select form-select-right form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="relevance" selected>Sortieren</option>
          <option value="price">Preis</option>
          <option value="review">Bewertung</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  </div>
  <div class="sortable-list" ref="sortableList">
    <div v-for="ssItem in sortedShownItems" v-bind:key="ssItem.id" class="item">
      <component :is="element" :data="ssItem"></component>
    </div>
    <div v-for="index in 2" :key="index" class="item"></div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import ProductTile from './ProductTile.vue';
import CompanyTile from './CompanyTile.vue';
/* eslint-enable no-unused-vars */

export default {
  name: 'SortableList',
  data() {
    return {
      categories: [],
      chosenCategories: [],
      searchString: '',
      shownItems: [],
      sortedShownItems: [],
      sortBy: this.element == 'CompanyTile' ? 'relevance' : '', //empty string if no sort is needed
      dir: 'up', //or 'down'
    };
  },
  props: ['items', 'element'],
  methods: {
    sort: function () {
      this.sortedShownItems = this.shownItems;
      if (this.sortBy == '') return;
      this.sortedShownItems.sort((a, b) => {
        if (
          typeof a[this.sortBy] == 'string' &&
          typeof b[this.sortBy] == 'string'
        )
          return a[this.sortBy].localeCompare(b[this.sortBy]);
        if (a[this.sortBy] > b[this.sortBy]) return 1;
        if (a[this.sortBy] < b[this.sortBy]) return -1;
        else return 0;
      });
      if (this.dir == 'down') this.sortedShownItems.reverse();
      return;
    },
    searchForString: function (string, object) {
      if (object == null) return 0;
      let instances = 0;
      if (typeof object == 'object') {
        if (!(object instanceof Array)) {
          let values = [];
          let searchKeys = [];
          if (this.element == 'CompanyTile')
            searchKeys = ['name', 'location', 'info'];
          else searchKeys = ['name', 'company_name', 'info'];
          searchKeys.forEach((key) => values.push(object[key]));
          object = values;
        }
        for (let i = 0; i < object.length; i++) {
          instances += this.searchForString(string, object[i]);
        }
        return instances;
      }
      if (typeof object != 'string') return 0;
      let match = object.match(new RegExp(string, 'gi'));
      if (match == null) return 0;
      return match.length;
    },
    generateShownItems: function () {
      let newShownItems = [];
      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];
        let matches = true;
        if (this.searchForString(this.searchString, item) == 0) matches = false;
        if (item.categories == null && this.chosenCategories.length != 0) {
          matches = false;
        } else {
          for (let j = 0; j < this.chosenCategories.length; j++) {
            if (!item.categories.includes(this.chosenCategories[j]))
              matches = false;
            if (
              item.categories[0] == 'Gastronomie & Dienstleistung' &&
              (this.chosenCategories[j] == 'Gastronomie' ||
                this.chosenCategories[j] == 'Dienstleistung')
            )
              matches = true;
          }
        }
        if (matches) newShownItems.push(item);
      }
      if (newShownItems != this.shownItems) {
        this.shownItems = newShownItems;
        this.sort();
      }
    },
    generateCategories: function () {
      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];
        if (item.categories == null) continue;
        for (let j = 0; j < item.categories.length; j++) {
          let category = item.categories[j];
          if (!this.categories.includes(category))
            this.categories.push(category);
        }
      }
    },
    companyCategoryChange() {
      const select = document.getElementById('companyCategory');
      const value = select.value;
      if (value == '') this.chosenCategories = [];
      else this.chosenCategories = [value];
    },
    productCategoryChange() {
      const select = document.getElementById('productCategory');
      const value = select.value;
      if (value == '') this.chosenCategories = [];
      else this.chosenCategories = [value];
    },
    companySortChange() {
      const select = document.getElementById('companySort');
      const value = select.value;
      this.sortBy = value;
      console.log(value);
    },
    productSortChange() {
      const select = document.getElementById('productSort');
      const value = select.value;
      this.sortBy = value;
    },
  },
  mounted() {
    this.generateCategories();
    this.generateShownItems();
  },
  watch: {
    items: function () {
      this.generateCategories();
      this.generateShownItems();
    },
    element: function () {
      this.generateShownItems();
    },
    searchString: function () {
      this.generateShownItems();
    },
    dir: function () {
      this.generateShownItems();
    },
    sortBy: function () {
      this.generateShownItems();
    },
    chosenCategories: function () {
      this.generateShownItems();
    },
  },
  components: { ProductTile, CompanyTile },
};
</script>

<style scoped>
.sortable-list {
  margin: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
}

.row {
  padding-top: 0;
  margin-top: 0;
  margin: 0 20px;
}

.item {
  margin: 0 10px 20px 10px;
}

.direction {
  border-color: #cfd4da;
  position: absolute;
  right: 0;
  width: 15%;
}

.form-select {
  position: absolute;
  width: 40%;
}

.form-select-right {
  left: 40%;
  margin: 0 2.5%;
}

.settings {
  position: relative;
  margin-bottom: 30px;
}

.search {
  margin-bottom: 5px;
}
</style>
