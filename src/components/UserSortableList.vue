<template>
  <div class="row" :class="{ noSearch: noSearch }">
    <div class="col-md-3 col-xl-4"></div>
    <div v-if="noSearch" class="search-comp col-12 col-md-6 col-xl-4"></div>
    <div v-else class="search-comp col-12 col-md-6 col-xl-4">
      <input
        class="search form-control form-control-lg me-2"
        type="search"
        placeholder="Suchen..."
        aria-label="Suchen..."
        on-
        @focus="focus = true"
        @focusout="removeFocus()"
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
          @change="userCategoryChange"
          id="userCategory"
          class="form-select form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="" selected>Alle</option>
          <option value="inCompany">In Unternehmen</option>
          <option value="companyLeader">Geschäftsführer</option>
          <option value="companyEmployee">Angestellte</option>
          <option value="noCompany">Nicht in Unternehmen</option>
          <option value="active">Aktiv</option>
          <option value="passive">Passiv</option>
        </select>
        <select
          @change="userSortChange"
          id="userSort"
          class="form-select form-select-right form-select-md mb-3"
          aria-label=".form-select-lg example"
        >
          <option value="name" selected>Sortieren</option>
          <option value="name">Vorname</option>
          <option value="lastName">Nachname</option>
          <option value="companyName">Unternehmen</option>
          <option value="activity">Aktivität</option>
        </select>
      </div>
    </div>
    <div class="col-md-3 col-xl-4"></div>
    <div class="col-md-3 col-xl-4"></div>
    <div class="col-12 col-md-6 col-xl-4">
      <button class="btn btn-primary mail" @click="mailSelected">
        <i class="fa-solid fa-envelope fa-lg"></i>
        Mail an Ausgewählte
      </button>
    </div>
  </div>
  <div class="sortable-list" ref="sortableList">
    <div v-for="ssItem in sortedShownItems" v-bind:key="ssItem.id">
      <component :is="element" :data="ssItem" class="item"></component>
    </div>
    <div v-for="index in 2" :key="index" class="item"></div>
  </div>

  <div v-if="shownItems.length == 0 && !loading" style="margin-bottom: 50px">
    <h4 class="empty">
      Es wurden keine Nutzer gefunden
    </h4>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import UserTile from './UserTile.vue';
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
      sortBy: 'name', //empty string if no sort is needed
      dir: 'up', //or 'down'
      directLinks: [],
      focus: false,
    };
  },
  props: ['items', 'element', 'loading', 'noSearch'],
  methods: {
    mailSelected() {
      let mails = []

      this.shownItems.forEach(user => {
        mails.push(user.email)
      })

      var link = 'mailto:?bcc='

      mails.forEach(mail => {
        link += mail + ','
      })

      location.href = link
    },
    sort: function () {
      this.sortedShownItems = this.shownItems;
      if (this.sortBy == '') return;

      if (this.sortBy == 'lastName') {
        this.sortedShownItems.sort((a, b) => {
          return a['name'].split(" ")[1].localeCompare(b['name'].split(" ")[1]);
        });
      }

      else if (this.sortBy == 'companyName') {
        this.sortedShownItems.sort((a, b) => {
          return a['name'].localeCompare(b['name']);
        });

        this.sortedShownItems.sort((a, b) => {
          if(a['company'] == undefined && b['company'] == undefined) return 0;
          if(a['company'] == undefined) return 1;
          if(b['company'] == undefined) return -1;
          return a['company']['name'].localeCompare(b['company']['name']);
        });
      }

      else if (this.sortBy == 'activity') {
        this.sortedShownItems.sort((a, b) => {
          return a['name'].localeCompare(b['name']);
        });

        this.sortedShownItems.sort((a, b) => {
          var activityA = a.orders == undefined ? 0 : a.orders.length;
          var activityB = b.orders == undefined ? 0 : b.orders.length;

          if (activityA < activityB) return 1;
          if (activityA > activityB) return -1;
          else return 0
        });
      }

      else {
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
      }

      if (this.dir == 'down') this.sortedShownItems.reverse();
      return;
    },
    searchForString: function (string, object) {
      if (string.startsWith('/')) string = string.substring(1);
      if (object == null) return 0;
      let instances = 0;
      if (typeof object == 'object') {
        if (!(object instanceof Array)) {
          let values = [];
          values.push(object['name']);
          if(object.company != undefined) values.push(object['company']['name']);
          
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

        if (this.chosenCategories.length != 0) {

          if(this.chosenCategories[0] == 'inCompany') {
            if(item.company == undefined) matches = false
          }
          else if(this.chosenCategories[0] == 'companyLeader') {
            if(item.isCompanyLeader != true) matches = false
          }
          else if(this.chosenCategories[0] == 'companyEmployee') {
            if(item.company == undefined || item.isCompanyLeader) matches = false
          }
          else if(this.chosenCategories[0] == 'noCompany') {
            if(item.company != undefined) matches = false
          }
          else if(this.chosenCategories[0] == 'active') {
            if(item.orders == undefined) matches = false
            else {
              var activity = item.orders.length
              if(activity == 0) matches = false
            }
          }
          else if(this.chosenCategories[0] == 'passive') {
            if(item.orders != undefined) matches = false
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
      this.categories = ['inCompany', 'companyLeader', 'companyEmployee', 'noCompany', 'active', 'passive']
    },
    userCategoryChange() {
      const select = document.getElementById('userCategory');
      const value = select.value;
      if (value == '') this.chosenCategories = [];
      else this.chosenCategories = [value];
    },
    userSortChange() {
      const select = document.getElementById('userSort');
      const value = select.value;
      this.sortBy = value;
      console.log(value);
    },
    removeFocus() {
      setTimeout(
        function () {
          this.focus = false;
        }.bind(this),
        200
      );
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
  components: { UserTile },
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
  margin-top: 5px;
}

.alias-suggestions {
  background-color: white;
  width: 100%;
  position: absolute;
  z-index: 10;
  border-radius: 0 0 0.375rem 0.375rem;
  border-color: #87b7ff;
  border-width: 0 1px 1px 1px;
  border-style: solid;
  text-align: left;
  padding-top: 10px;
}

.alias-wrapper {
  position: relative;
  bottom: 12px;
}

.alias-link {
  margin: 0 10px 10px 10px;
  font-size: 1.2rem;
  font-weight: 200;
}

.fa-arrow-right {
  margin-left: 5px;
}

.empty {
  margin: 0 10px;
}

.noSearch {
  margin-bottom: 0;
  padding-bottom: 20px;
}

.mail {
  position: relative;
  top: 19px;
  width: 100%;
}

.fa-envelope {
  margin-right: 5px;
}

</style>
