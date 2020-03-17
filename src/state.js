import Vue from 'vue'

const getInitialState = function () {
  try {
    const stored = localStorage.getItem('charts')
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    return {}
  }
}

const state = new Vue({
  data: {
    charts: getInitialState()
  },

  watch: {
    charts (charts) {
      const data = {}
      Object.keys(charts).forEach(country => {
        data[country] = []
      })
      localStorage.setItem('charts', JSON.stringify(data))
    }
  },

  methods: {
    async fetchChart () {
      const response = await fetch('https://pomber.github.io/covid19/timeseries.json')
      const data = await response.json()
      this.charts = data
    },

    getChart (country) {
      if (this.charts[country]) {
        return this.charts[country]
      }

      return []
    }
  },

  computed: {
    aggregated () {
      const aggregated = {}
      Object.keys(this.charts).forEach(country => {
        Object.keys(this.charts[country]).forEach(date => {
          if (!aggregated[date]) {
            aggregated[date] = { ...this.charts[country][date] }
          } else {
            aggregated[date].confirmed += this.charts[country][date].confirmed
            aggregated[date].deaths += this.charts[country][date].deaths
            aggregated[date].recovered += this.charts[country][date].recovered
          }
        })
      })

      return Object.keys(aggregated).map(key => {
        return aggregated[key]
      })
    }
  }
})

export default state
