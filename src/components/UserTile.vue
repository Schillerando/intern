<template>
  <router-link :to="link">
    <div class="sizing" :class="{ 'no-hover': noHover }">
      <div class="card">
        <div class="name">
          {{ data.name }}
          <i v-if="data.isCompanyLeader" class="fa-solid fa-user-tie fa-md"></i>
        </div>
        <div class="">
          {{ data.email }}
        </div>
        <div class="company">
          <div v-if="data.company != undefined" class="company">
            <CompanyBadge
              :verified="data.company.abo != null && data.company.abo != ''"
              :premium="data.company.abo == 'Business'"
              :self="data.company.alias == 'schillerando'"
              class="company-badge"
            ></CompanyBadge>
            <span class="company-name">{{ data.company.name }}</span>
          </div>
          <div v-else style="height: 35px;"></div>
        </div>
        <div class="activity">
          <div>
            <span v-if="data.orders != undefined" >{{ data.orders.length }}</span>
            <span v-else>0</span>
            <i class="fa-solid fa-truck"></i>
          </div>
        </div>
      </div>
    </div>
</router-link>
</template>

<script>
import CompanyBadge from './CompanyBadge.vue';

export default {
  name: 'UserTile',
  components: { CompanyBadge },
  props: ['data', 'noHover'],
  computed: {
    link() {
      return `/users/${this.data.id}`;
    },
  },
};
</script>

<style scoped>

img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sizing {
  position: relative;
  margin: 2.5%;
}

.card {
  text-align: left;
  padding: 5px 10px;
  margin: 0;
}

.name {
  font-weight: bold;
  font-size: 1.3rem;
}

.company {
  display: flex;
  margin: 5px 0;
}

.company-name {
  font-size: 1.1rem;
  margin: 0 5px;
  max-lines: 1;
  overflow: hidden;
}

.fa-truck {
  margin-left: 5px;
}

.fa-user-tie {
  position: relative;
  margin-left: 5px;
}

.activity {
  margin-top: 5px;
}

.no-hover {
  color: black;
}


</style>
