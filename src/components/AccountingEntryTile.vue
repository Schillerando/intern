<template>
  <EditAccountingEntryOverlay v-if="edit" :data="entry" @stopEditingEntry="stopEditingEntry($event)" @deleteEntry="deleteEntry($event)"/>

  <div class="card">
    <div class="image">
      <div v-if="this.picture == null" class="no-image">
        <i class="fa-solid fa-image fa-2xl"></i>
      </div>
      <img v-else :src="this.picture" alt="" />
    </div>
    <div class="info">
      <div class="row">
        <div class="col col-9">
          <p class="name">{{ entry.name }}</p>
          <p class="category">{{ entry.type }}</p>
  
        </div>
        <div class="col col-3">
          <button @click="edit = true" class="btn btn-primary">
            <i class="fa-solid fa-pen-to-square fa-lg"></i>

          </button>
        </div>
      </div>  

      <p class="description">{{ entry.info }}</p>

      <p class="price">{{ entry.amount }} $</p>

    </div>
  </div>
</template>

<script>
import EditAccountingEntryOverlay from "./EditAccountingEntryOverlay.vue"
import { reactive } from 'vue';

export default {
  name: 'AccountingEntryTile',
  props: ['data', 'products'],
  components: { EditAccountingEntryOverlay },
  emits: ['deleteEntry', 'editEntry'],
  data() {
    return {
      edit: false,
      picture: null
    };
  },
  setup() {
    var entry = reactive({
      id: null,
      name: '',
      type: '',
      info: '',
      amount: '',
      product: null,
      created_at: '',
      imageBefore: null, 
      image: null, 
      bill_picture: ''
    });

    return {
      entry,
    };
  },
  async mounted() {
    if(this.entry != null) {
      this.entry.id = this.data.id;
      this.entry.name = this.data.name;
      this.entry.type = this.data.type;
      this.entry.info = this.data.info;
      this.entry.amount = this.data.amount;
      this.entry.product = this.products.find(product => product.id == this.data.product);
      this.entry.bill_picture = this.data.bill_picture;

      /*
      if (this.data.product_picture != null) {
        const response = await supabase.storage
          .from('public/products-pictures')
          .download(this.data.product_picture);
        if (response.data != null) {
          this.product.image = await response.data.text();
          this.product.imageBefore = this.product.image
          this.picture = this.product.image
        } 
        if (response.error) console.warn(response.error);
      } else if (this.data.image != null ) {
        this.product.image = this.data.image;
        this.product.imageBefore = this.data.image
        this.picture = this.data.image
      }
      */
    }
  },
  methods: {
    stopEditingEntry(entryData) {
      this.edit = false;

      if(entryData == null) return;

      this.product = entryData;
      this.picture = entryData.image;
    },
    deleteEntry(entryData) {
      this.edit = false;
      
      this.$emit('deleteEntry', entryData)
    }
  }
};
</script>

<style scoped>
.price,
.name {
  font-size: 1.25rem;
  padding: 0;
  margin: 0;
  font-weight: 600;
}

.btn {
  position: absolute;
  top: 15px;
  right: 10px;
  padding: 2px 5px 3px 5px;
}

.name {
  text-align: left;
  margin: 10px 15px 0 15px;
}

.description {
  text-align: left;
  margin: 10px 15px 0 15px;
  font-size: 0.9rem;
  line-height: 1.0rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}


.price {
  position: absolute;
  text-align: left;
  bottom: 8px;
  left: 15px;
  color: black;
}

.settings {
  position: absolute;
  text-align: left;
  bottom: 8px;
  right: 15px;
  color: black;
  padding: 3px;
}

.row,
.col {
  margin: 0;
  padding: 0;
}

.info {
  position: absolute;
  width: 60%;
  height: 100%;
  top: 0;
  left: 40%;
}

.card {
  flex-direction: row;
  overflow: hidden;
  margin: 2.5%;
}

.image {
  width: 40%;
  position: relative;
  padding-bottom: 40%;
  margin-right: 10px;
  border-right: 1px solid;
  border-color: #cfd4da;
}

.no-image {
  background-color: gray;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

img {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
}

.category {
  text-align: left;
  margin-top: -10px;
  font-weight: 300;
  margin: -10px 15px 0 15px;
}

.btn-primary {
  background-color: #00a100;
  border-color: #00a100;
}

.btn-primary:hover {
  background-color: #007400;
  border-color: #007400;
}

.fa-image {
  position: absolute;
  font-size: 4rem;
  top: 50%;
  left: calc(50% - 2rem);
  color: black;
}

/*   border-radius: 0.375rem 0 0 0.375rem; */
</style>
