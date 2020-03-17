<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['data', 'options'],
  mounted () {
    this.renderChart(this.data, this.options)
  },
  watch: {
    options () {
      this.renderChart(this.data, this.options)
    },
    data () {
      this.renderChart(this.data, this.options)
    }
  }
}
</script>

<style>
</style>
