<template>
  <div v-if="store.getters.getUser.id != store.getters.getUserCompany.user_uid && store.getters.getUserCompany.abo != '' && store.getters.getUserCompany.abo != null" class="overlay">
    <div class="centered">
      <img class="lock" src="@/assets/lock.png" alt="">
      <h4 class="mt-3">Auf diese Seite hat nur der Geschäftsführer Zugriff!</h4>
    </div>

  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'NoAccessOverlay',
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router
    };
  },
};
</script>

<style scoped>
.overlay {
  overflow: hidden;
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
	height: 100%;
	box-shadow: 0 0 1rem 0 rgba(0, 0, 0, .2);	
	border-radius: 5px;
	background-color: rgba(255, 255, 255, .15);
	
	backdrop-filter: blur(5px);
}


.centered {
  position: relative;
  margin: auto;
  top: 35%;
}


/*
.overlay {
  position: absolute;
  top: 0;
  background-color: white;
  opacity: 50%;
  width: 100%;
	height: 100vh;
}
*/
</style>
