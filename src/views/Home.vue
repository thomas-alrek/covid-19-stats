<template>
  <div class="home">
    <Stats />
  </div>
</template>

<script>
// @ is an alias to /src
import Stats from '@/components/Stats.vue'

export default {
  name: 'Home',
  components: {
    Stats
  }
}
</script>
