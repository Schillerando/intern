<template>
  <div class="card">
    <div class="header" @click="toProduct()">
      <div>
        <h6 v-if="data.anonym || data.users == null">Anonym ({{ data.users.name }})</h6>
        <h6 v-else>{{ data.users.name }}</h6>
      </div>

      <div class="stars">
        <div v-for="star in [0, 1, 2, 3, 4]" :key="star">
          <i
            v-if="star < data.stars"
            class="fa-solid fa-star fa-lg solid-star"
          ></i>
          <i v-else class="fa-regular fa-star fa-lg"></i>
        </div>
      </div>
    </div>

    <div class="info">
      <p class="text">{{ data.text }}</p>
    </div>

    <div class="date">
      <p>{{ date }} • {{ time }}</p>
    </div>

    <div class="actions">
      <button v-if="this.data.verified == null" class="btn btn-primary confirm-button" @click="verifyReview()">
        <i class="fa-solid fa-check"></i>
      </button>
      <button class="btn btn-danger confirm-button" @click="deleteReview()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>
  
</template>

<script>
import { supabase } from '@/supabase';
import { useStore } from 'vuex';
import { reformatDate, cutSecondsFromTime } from '../helpers.js';

export default {
  name: 'ReviewTile',
  props: ['data'],
  emits: ['deleteReview', 'verifyReview'],
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
  data() {
    return {
      date: '',
      time: '',
    };
  },
  mounted() {
    this.date = reformatDate(this.data.created_at.split('T')[0]);
    this.time = cutSecondsFromTime(this.data.created_at.split('T')[1]);
  },
  computed: {
    link() {
      return process.env.VUE_APP_MAIN_URL + '/' + this.data.companies.alias + '/' + this.data.product
    }
  },
  methods: {
    async verifyReview() {

      try {

        const { error } = await supabase
          .from('product_reviews')
          .update({
            verified: true
          })
          .eq('id', this.data.id)

        if(error) throw error

        this.$emit('verifyReview', this.data.id)

      } catch(e) {
        console.log(e)
      }

    },
    async deleteReview() {

      try {

        const { error } = await supabase
          .from('product_reviews')
          .delete()
          .eq('id', this.data.id)

        if(error) throw error

        this.$emit('deleteReview', this.data.id)

      } catch(e) {
        console.log(e)
      }

    },
    toProduct() {
      location.href = this.link
    }
  }
};
</script>

<style scoped>
.card {
  text-align: left;
}

.header:hover {
  color: blue;
}

.fa-star {
  margin-right: 5px;
}

.solid-star {
  color: #e3c100;
}

.stars {
  display: flex;
  position: absolute;
  right: 5px;
  top: 5px;
}

.header {
  margin: 5px 5px 0 10px;
}

h6 {
  font-size: 1.2rem;
  position: relative;
  top: 3px;
  max-width: calc(100% - 150px);
}

.info {
  margin: 0 10px;
}

.text {
  margin: 0 0 5px 0;
}

.date {
  margin: 0 10px 5px 10px;
  font-size: 0.8rem;
  color: grey;
}

p {
  margin: 0;
}

.btn {
  padding: 2px 8px;
  margin: 0 2px 5px 10px;
}
</style>
