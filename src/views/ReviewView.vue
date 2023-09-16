<template>
  <TitleDiv title="Rezensionen"></TitleDiv>

  <div class="reviews">
    <div v-for="review in reviews" :key="review.id" class="review">
      <ReviewTile @verifyReview="verifyReview($event)" @deleteReview="deleteReview($event)" :data="review" v-if="review.verified == null" />
    </div>

    <h4 class="m-4">
      Verifiziert
    </h4>

    <div v-for="review in reviews" :key="review.id" class="review">
      <ReviewTile @verifyReview="verifyReview($event)" @deleteReview="deleteReview($event)" :data="review" v-if="review.verified" />
    </div>
  </div>
  
</template>

<script>
import TitleDiv from '@/components/TitleDiv.vue';
import { useStore } from 'vuex';
import { supabase } from '@/supabase';
import ReviewTile from '@/components/ReviewTile.vue';

export default {
  name: 'ReviewView',
  components: {
    TitleDiv,
    ReviewTile
},
  setup() {
    const store = useStore();

    return {
      store,
    }
  },
  data() {
    return {
      reviews: []
    };
  },
  async mounted() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, users(*), companies(alias)')

      if(error != null) throw error

      this.reviews = data

      this.reviews.sort((a,b) => b.created_at.localeCompare(a.created_at))
    } catch(e) {
      console.log(e)
    }
  },
  methods: {
    verifyReview(id) {
      this.reviews[this.reviews.findIndex(review => review.id == id)].verified = true
    },
    deleteReview(id) {
      this.reviews = this.reviews.filter(review => review.id != id)
    }
  }
};
</script>

<style scoped>
.reviews {
  margin: 0 20px;
}

.review {
  margin-bottom: 10px;
}
</style>