<template>
  <div class="stats">
    <br>
    <h1 v-if="!country">COVID-19 Stats Worldwide</h1>
    <h1 v-else>COVID-19 Stats for {{ country }}</h1>

    <p>Last update {{ lastUpdated }}</p>

    <div style="display: flex; justify-content: center;">
      <select id="country" v-model="country">
        <option :value="null">Worldwide</option>
        <option value="" disabled>---</option>
        <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
      </select>
    </div>

    <p>
      <strong>
        <template v-if="infectionPercentageDiff">
          <span :class="infectionTrendClass">
            Number of active cases has {{ infectionTrendMessage }} ({{ (infectionTrendClass === 'danger' ? 'up' : 'down') + ' ' + `${infectionPercentageDiff.toFixed(1)}%` }})
          </span>
        </template>
        <template v-else>
          Number of active cases remains unchaged
        </template>
      </strong>
    </p>

    <br>

    <table id="stats">
      <thead>
        <tr>
          <th></th>
          <th>Confirmed</th>
          <th>Recovered</th>
          <th>Deaths</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Total</th>
          <td>
              <animated-number
                :value="totalConfirmed"
                :formatValue="value => Math.floor(value)"
                :duration="this.animationSpeed"
              />
          </td>
          <td>
              <animated-number
                :value="totalRecovered"
                :formatValue="value => Math.floor(value)"
                :duration="this.animationSpeed"
              />
          </td>
          <td>
              <animated-number
                :value="totalDeaths"
                :formatValue="value => Math.floor(value)"
                :duration="this.animationSpeed"
              />
          </td>
        </tr>
        <tr>
          <th scope="row">Changes</th>
          <td :class="diffConfirmedClass">
              <animated-number
                :value="diffConfirmed"
                :formatValue="formatDiff"
                :duration="this.animationSpeed"
              />
          </td>
          <td :class="diffRecoveredClass">
              <animated-number
                :value="diffRecovered"
                :formatValue="formatDiff"
                :duration="this.animationSpeed"
              />
          </td>
          <td :class="diffDeathsClass">
              <animated-number
                :value="diffDeaths"
                :formatValue="formatDiff"
                :duration="this.animationSpeed"
              />
          </td>
        </tr>
      </tbody>
    </table>

    <form style="padding: 1rem;">
      <input id="showSeparateChartsTrue" type="radio" name="showSeparateCharts" v-model="showSeparateCharts" :value="true">
      <label for="showSeparateChartsTrue" style="padding-right: 1rem">Individual stats</label>
      <input id="showSeparateChartsFalse" type="radio" name="showSeparateCharts" v-model="showSeparateCharts" :value="false">
      <label for="showSeparateChartsFalse">Combined stats</label>

      <p>
        <input id="useLogarithmicScale" type="checkbox" v-model="useLogarithmicScale">
        <label for="useLogarithmicScale" style="padding-right: 1rem">Use logarithmic scale</label>
      </p>
    </form>

    <br>

    <hr>

    <br>

    <div class="charts">
      <template v-if="!showSeparateCharts">
        <LineChart :data="aggregated" :options="options" />
      </template>
      <template v-else>
        <LineChart id="confirmed" :data="confirmedChart" :options="options" />
        <br>
        <hr>
        <br>
        <LineChart id="recovered" :data="recoveredChart" :options="options" />
        <br>
        <hr>
        <LineChart id="deaths" :data="deathChart" :options="options" />
        <br>
        <hr>
        <LineChart id="infected" :data="infectedChart" :options="options" />
      </template>
      <br>
      <i>* Calculated by subtracting recoveries or deaths from the confirmed cases</i>
    </div>

    <br>

    <hr>

    <h2>Learn more about <a target="_blank" href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019">COVID-19</a></h2>
    <hr>

    <p>
      <strong>Sources</strong>

      <ul style="list-style-type: none; padding-inline-start: 0;">
        <li><a target="_blank" href="https://www.who.int">World Health Organization (WHO)</a></li>
        <li><a target="_blank" href="http://3g.dxy.cn/newh5/view/pneumonia">DXY.cn. Pneumonia. 2020</a></li>
        <li><a target="_blank" href="https://bnonews.com/index.php/2020/02/the-latest-coronavirus-cases">BNO News</a></li>
        <li><a target="_blank" href="http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml">National Health Commission of the People’s Republic of China (NHC)</a></li>
        <li><a target="_blank" href="http://weekly.chinacdc.cn/news/TrackingtheEpidemic.htm">China CDC (CCDC)</a></li>
        <li><a target="_blank" href="https://www.chp.gov.hk/en/features/102465.html">Hong Kong Department of Health</a></li>
        <li><a target="_blank" href="https://www.ssm.gov.mo/portal/">Macau Government</a></li>
        <li><a target="_blank" href="https://sites.google.com/cdc.gov.tw/2019ncov/taiwan?authuser=0">Taiwan CDC</a></li>
        <li><a target="_blank" href="https://www.cdc.gov/coronavirus/2019-ncov/index.html">US CDC</a></li>
        <li><a target="_blank" href="https://www.canada.ca/en/public-health/services/diseases/coronavirus.html">Government of Canada</a></li>
        <li><a target="_blank" href="https://www.health.gov.au/news/coronavirus-update-at-a-glance">Australia Government Department of Health</a></li>
        <li><a target="_blank" href="https://www.ecdc.europa.eu/en/geographical-distribution-2019-ncov-cases">European Centre for Disease Prevention and Control (ECDC)</a></li>
        <li><a target="_blank" href="https://www.moh.gov.sg/covid-19">Ministry of Health Singapore (MOH)</a></li>
        <li><a target="_blank" href="http://www.salute.gov.it/nuovocoronavirus">Italy Ministry of Health</a></li>
      </ul>
    </p>

    <hr>
    <br>

    <i>
      Aggregated through <a target="_blank" href="https://github.com/pomber/covid19">pomber/covid19</a> using data provided by <a href="https://github.com/CSSEGISandData/COVID-19">2019 Novel Coronavirus COVID-19 (2019-nCoV) Data Repository by Johns Hopkins CSSE</a>
    </i>

    <hr>

    <p>
      <i>
        All data and information provided on this site is for informational purposes only. I make no representation as to accuracy, completeness, currentness, suitability, or validity of any information on this site and will not be liable for any errors, omissions, or delays in this information or any losses, injuries, or damages arising from its display or use. All information is provided on an as-is basis.
      </i>
    </p>

    <hr>
    <br>

    Developed by <a target="_blank" href="https://github.com/thomas-alrek">Thomas Alrek</a>
    <br>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import state from '../state'
import AnimatedNumber from 'animated-number-vue'
import LineChart from './LineChart'

const countryMappings = {
  'United States': 'US',
  Deutschland: 'Germany'
}

const getInitialUseLogarithmicScale = () => {
  try {
    const storedUseLogarithmicScale = localStorage.getItem('useLogarithmicScale')
    const scale = storedUseLogarithmicScale ? JSON.parse(storedUseLogarithmicScale) : false
    return scale
  } catch (e) {
    return false
  }
}

const getInitialCountry = () => {
  try {
    const storedCountry = localStorage.getItem('country')
    const country = storedCountry ? JSON.parse(storedCountry) : null
    if (countryMappings[country]) {
      return countryMappings[country]
    }
    return country
  } catch (e) {
    return null
  }
}

const getInitialLegends = () => {
  const defaults = {
    confirmed: true,
    recovered: true,
    deaths: true,
    infected: true
  }
  try {
    const storedLegends = localStorage.getItem('legends')
    return storedLegends ? JSON.parse(storedLegends) : defaults
  } catch (e) {
    return defaults
  }
}

const getInitialShowSeparateCharts = () => {
  try {
    const storedShowSeparateCharts = localStorage.getItem('showSeparateCharts')
    return storedShowSeparateCharts ? JSON.parse(storedShowSeparateCharts) : true
  } catch (e) {
    return true
  }
}

export default {
  name: 'HelloWorld',
  components: {
    AnimatedNumber,
    LineChart
  },
  data: () => ({
    state,
    useLogarithmicScale: getInitialUseLogarithmicScale(),
    legends: getInitialLegends(),
    animationSpeed: 1000,
    specificCountry: false,
    showSeparateCharts: getInitialShowSeparateCharts(),
    country: getInitialCountry()
  }),

  methods: {
    async getUsersCountry () {
      try {
        const response = await fetch('https://freegeoip.app/json/')
        const { country_name: country } = await response.json()
        if (this.countries.indexOf(country) > -1) {
          this.country = country
          this.specificCountry = true
        }
      } catch (e) {
        this.country = null
      }
    },
    formatDate (date) {
      return dayjs(date)
        .toDate()
        .toLocaleDateString('sv-SE', { timezone: 'Europe/Oslo' })
    },
    formatDiff (diff) {
      const symbol = diff > 0 ? '+' : ''
      return `${symbol}${Math.floor(diff)}`
    }
  },

  computed: {
    scale () {
      return this.useLogarithmicScale ? 'logarithmic' : 'linear'
    },

    countries () {
      return Object.keys(this.state.charts).sort()
    },

    infectionPercentageDiff () {
      if (this.trend.length > 1) {
        const current = this.trend[this.trend.length - 1]
        const previous = this.trend[this.trend.length - 2]

        return 100 * Math.abs((current - previous) / ((current + previous) / 2))
      }

      return 0
    },

    infectionTrend () {
      if (this.trend.length > 1) {
        const current = this.trend[this.trend.length - 1]
        const previous = this.trend[this.trend.length - 2]
        return previous > current ? -1 : 1
      }

      return 0
    },

    infectionTrendMessage () {
      return this.infectionTrend > 0 ? 'increased' : this.infectionTrend < 0 ? 'decreased' : 'not enough data'
    },

    infectionTrendClass () {
      return this.infectionTrend > 0 ? 'danger' : this.infectionTrend < 0 ? 'success' : ''
    },

    options () {
      return {
        animation: {
          duration: this.animationSpeed
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          onClick: (event, legend) => {
            const legends = { ...this.legends }

            switch (legend.text) {
              case 'Confirmed':
                legends.confirmed = !legends.confirmed
                break
              case 'Recovered':
                legends.recovered = !legends.recovered
                break
              case 'Deaths':
                legends.deaths = !legends.deaths
                break
              case 'Infected *':
                legends.infected = !legends.infected
                break
              default:
                break
            }

            this.legends = legends
            return false
          },
          labels: {
            fontColor: '#bdc3c7'
          },
          position: 'bottom'
        },
        scales: {
          yAxes: [{
            type: this.scale,
            ticks: {
              precision: 0,
              fontColor: '#bdc3c7'
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: '#bdc3c7'
            }
          }]
        }
      }
    },

    datasource () {
      if (this.country) {
        if (this.state.charts[this.country]) {
          return this.state.charts[this.country]
        }

        return []
      }

      return this.state.aggregated
    },

    diffConfirmedClass () {
      return this.diffConfirmed > 0 ? 'danger' : this.diffConfirmed < 0 ? 'success' : 'success'
    },

    diffRecoveredClass () {
      return this.diffRecovered > 0 ? 'success' : this.diffRecovered < 0 ? 'danger' : 'danger'
    },

    diffDeathsClass () {
      return this.diffDeaths > 0 ? 'danger' : this.diffDeaths < 0 ? 'success' : 'success'
    },

    diffConfirmed () {
      return this.confirmed[this.confirmed.length - 1] - this.confirmed[this.confirmed.length - 2]
    },

    diffRecovered () {
      return this.recovered[this.recovered.length - 1] - this.recovered[this.recovered.length - 2]
    },

    diffDeaths () {
      return this.deaths[this.deaths.length - 1] - this.deaths[this.deaths.length - 2]
    },

    totalConfirmed () {
      return this.confirmed[this.confirmed.length - 1]
    },

    totalRecovered () {
      return this.recovered[this.recovered.length - 1]
    },

    totalDeaths () {
      return this.deaths[this.deaths.length - 1]
    },

    confirmed () {
      return this.datasource.map(stat => {
        return stat.confirmed
      })
    },

    deaths () {
      return this.datasource.map(stat => {
        return stat.deaths
      })
    },

    previousUpdated () {
      if (this.datasource.length > 1) {
        return this.formatDate(this.datasource[this.datasource.length - 2].date)
      }

      return 'last update'
    },

    lastUpdated () {
      if (this.datasource.length) {
        return this.formatDate(this.datasource[this.datasource.length - 1].date)
      }

      return '...'
    },

    recovered () {
      return this.datasource.map(stat => {
        return stat.recovered
      })
    },

    trend () {
      return this.confirmed.map((confirmed, i) => {
        return confirmed - (this.deaths[i]) - (this.recovered[i])
      })
    },

    dates () {
      return this.datasource.map(stat => {
        return this.formatDate(stat.date)
      })
    },

    confirmedChart () {
      return {
        labels: this.dates,
        datasets: [
          {
            label: 'Confirmed',
            borderColor: 'rgb(52,152,221)',
            backgroundColor: 'rgba(52,152,221, 0.3)',
            data: this.confirmed
          }
        ]
      }
    },

    recoveredChart () {
      return {
        labels: this.dates,
        datasets: [
          {
            label: 'Recovered',
            borderColor: 'rgb(46,204,119)',
            backgroundColor: 'rgba(46,204,119, 0.3)',
            data: this.recovered
          }
        ]
      }
    },

    deathChart () {
      return {
        labels: this.dates,
        datasets: [
          {
            label: 'Deaths',
            borderColor: 'rgb(231,76,51)',
            backgroundColor: 'rgba(231,76,51, 0.3)',
            data: this.deaths
          }
        ]
      }
    },

    infectedChart () {
      return {
        labels: this.dates,
        datasets: [
          {
            id: 'infected',
            label: 'Infected *',
            borderColor: 'rgb(155,89,187)',
            backgroundColor: 'rgba(155,89,187, 0.3)',
            data: this.trend
          }
        ]
      }
    },

    aggregated () {
      return {
        labels: this.dates,
        datasets: [
          { ...this.confirmedChart.datasets[0], hidden: !this.legends.confirmed },
          { ...this.recoveredChart.datasets[0], hidden: !this.legends.recovered },
          { ...this.deathChart.datasets[0], hidden: !this.legends.deaths },
          { ...this.infectedChart.datasets[0], hidden: !this.legends.infected }
        ]
      }
    }
  },

  async mounted () {
    await state.fetchChart()

    if (this.$route.params.country) {
      if (countryMappings[this.$route.params.country]) {
        this.$route.params.country = countryMappings[this.$route.params.country]
      }
      if (this.countries.indexOf(this.$route.params.country) > -1) {
        this.country = this.$route.params.country
        this.specificCountry = true
      }
    }

    const firstLoad = !localStorage.getItem('initialized')

    if (!this.country && firstLoad) {
      await this.getUsersCountry()
    }

    if (firstLoad) {
      localStorage.setItem('initialized', 1)
    }
  },

  watch: {
    country: {
      immediate: true,
      handler (country) {
        localStorage.setItem('country', JSON.stringify(country))
        if (country) {
          window.history.pushState(country, country, `/${country}`)
        } else {
          window.history.pushState(country, country, '/')
        }
      }
    },
    useLogarithmicScale (useLogarithmicScale) {
      localStorage.setItem('useLogarithmicScale', JSON.stringify(useLogarithmicScale))
    },
    legends (legends) {
      localStorage.setItem('legends', JSON.stringify(legends))
    },
    showSeparateCharts (showSeparateCharts) {
      localStorage.setItem('showSeparateCharts', JSON.stringify(showSeparateCharts))
    }
  }
}
</script>

<style lang="scss">
  .stats {
    color: #bdc3c7!important;

    th, tr, hr {
      border-color: #161f27!important;
    }
  }

  .danger {
    color: #e74c3c;
  }

  .success {
    color: #2ecc71;
  }
</style>
