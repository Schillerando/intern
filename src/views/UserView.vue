<template>
  <TitleDiv title="Nutzer"></TitleDiv>

  <h2 v-if="users != undefined">Anzahl: {{ users.length }}</h2>

  <div>
    <UserSortableList v-if="users != undefined" :items="users" element="UserTile"></UserSortableList>
  </div>
</template>

<script>
import TitleDiv from '@/shared/components/TitleDiv.vue';
import UserSortableList from '@/components/UserSortableList.vue';
import { supabase } from '@/supabase';

export default {
  name: 'UserView',
  components: {
    TitleDiv,
    UserSortableList
  },
  data() {
    return {
      users: undefined
    };
  },
  async mounted() {

    try {

      const { data, error } = await supabase
        .from('users')
        .select()

      if(error) throw error;

      this.users = data

      {
        const { data, error } = await supabase
        .from('orders')
        .select()

        if(error) throw error;

        data.forEach(order => {
          var index = this.users.findIndex(user => user.id == order.buyer)
          if(index != -1) {
            if(this.users[index].orders == undefined) this.users[index].orders = []
            this.users[index].orders.push(order)
          }
        })
      }

      {
        const { data, error } = await supabase
          .from('companies')
          .select()

        if(error) throw error;

        console.log(data)

        data.forEach(company => {
          var index = this.users.findIndex(user => user.id == company.user_uid)

          if(index != -1) {
            this.users[index].company = company
            this.users[index].isCompanyLeader = true
          }

          if(company.employees != null) {
            company.employees.forEach(employee => {
              var index = this.users.findIndex(user => user.email == employee)

              if(index != -1) {
                this.users[index].company = company
              }
            })
            }
          
        })
      }

      this.users.sort((a, b) => a.name.localeCompare(b.name))

    } catch (e) {
      console.log(e);
    }

  }
};
</script>

<style scoped>

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

h2 {
  margin-top: -20px;
  margin-bottom: 20px;
}

</style>
