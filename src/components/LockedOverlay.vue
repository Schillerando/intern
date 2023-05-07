<template>
  <div v-if="store.getters.getUserCompany.abo == '' || store.getters.getUserCompany.abo == null" class="overlay">
    <div class="centered">
      <img class="lock" src="@/assets/lock.png" alt="">
      <button class="btn btn-primary">Abo auswählen</button>
    </div>

  </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
  name: 'LockedOverlay',
  setup() {
    const store = useStore();

    return {
      store,
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

.btn {
  top: 20px;
  position: relative;
  font-size: 1.5rem;
  margin: auto;
  display: block;
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
