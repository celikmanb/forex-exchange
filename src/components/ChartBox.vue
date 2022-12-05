<template>
  <v-card elevation="10">
    <v-card-title>
      <v-row align="start" style="flex-direction: column">
        <div class="text-caption grey--text text-uppercase">
          <div
            v-if="currencySymbol.length > 0"
            :class="`currency-flag ${
              currencySymbol
                ? 'currency-flag-' + currencySymbol[0].toLowerCase()
                : ''
            }`"
          ></div>
          <div
            v-if="currencySymbol.length > 0"
            :class="`currency-flag ${
              currencySymbol
                ? 'currency-flag-' + currencySymbol[1].toLowerCase()
                : ''
            }`"
          ></div>
        </div>
        <div>
          <span class="text-h5 font-weight-black" v-text="currencyText"></span>
        </div>
      </v-row>
      <v-spacer></v-spacer>
      <div class="price-info-box">
        <div class="current-price-box text-right">
          <span>{{currencySymbol.length > 0 ? currencySymbol[1] : ''}} {{ currentRate?.ask }}</span>
        </div>
        <div class="difference-box">
          <span :style="{color: differenceColor, fontSize: '16px' }" class="mr-2">{{ isNaN(differencePrice.value) ? 0 : differencePrice.value.toFixed(6) }}</span>
          <span :style="{color: differenceColor, fontSize: '16px'}">({{ isNaN(differencePrice.percentage) ? 0 : differencePrice.percentage.toFixed(6).toString() }}%)</span>
        </div>
      </div>
    </v-card-title>

    <line-chart :chart-data="chartData" />

    <v-row justify="space-around">
      <v-col cols="12" style="padding-bottom: 0px">
        <v-sheet
          elevation="10"
          class="py-4 px-1"
          style="display: flex; justify-content: space-around"
        >
          <v-chip-group
            v-model="selectedTime"
            mandatory
            active-class="primary--text"
          >
            <v-chip class="mr-4 ml-4" v-for="time in timeRange" :key="time">
              {{ time }}
            </v-chip>
          </v-chip-group>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import LineChart from "./LineChart.vue";
export default {
  props: {
    chartData: {
      type: Object,
    },
    currentRate: {
      type: Object,
    },
    currencyText: {
      type: String,
    },
  },
  components: {
    LineChart,
  },
  data() {
    return {
      currencySymbol: [],
      timeRange: ["15M", "1H", "1D", "1W", "1M"],
      selectedTime: [],
      differencePrice: {
        value: 0,
        percentage: 0,
      },
    };
  },
  computed: {
    differenceColor() {
      return this.differencePrice.value >= 0 ? 'green' : 'red'
    }
  },
  watch: {
    chartData: {
      handler(val) {
        let dataset = val.datasets[0].data;
        let differenceValue = dataset[dataset.length - 1] - dataset[0];
        let differencePercentage =
          ((dataset[dataset.length - 1] - dataset[0]) * 100) / dataset[0];
        this.differencePrice = {
          value: isNaN(differenceValue) ? 0 : differenceValue ,
          percentage: isNaN(differencePercentage) ? 0 : differencePercentage ,
        };
      },
      deep: true,
    },
    currencyText(val) {
      this.currencySymbol = val.split("/");
    },
    selectedTime(val) {
      //val ==> index
      let currentRange = {};
      switch (val) {
        case 0:
          currentRange.date = this.addMinutes(new Date(), 15);
          currentRange.period = "1";
          currentRange.interval = "minute";
          break;
        case 1:
          currentRange.date = this.addMinutes(new Date(), 60);
          currentRange.period = "5";
          currentRange.interval = "minute";
          break;
        case 2:
          currentRange.date = this.addMinutes(new Date(), 24 * 60);
          currentRange.period = "1";
          currentRange.interval = "hourly";
          break;
        case 3:
          currentRange.date = this.addMinutes(new Date(), 24 * 60 * 7);
          currentRange.period = "1";
          currentRange.interval = "daily";
          break;
        case 4:
          currentRange.date = this.addMinutes(new Date(), 24 * 60 * 7 * 30);
          currentRange.period = "1";
          currentRange.interval = "daily";
          break;

        default:
          currentRange.date = this.addMinutes(new Date(), 15);
          currentRange.period = "1";
          currentRange.interval = "minute";
          break;
      }
      this.$emit("currentTime", currentRange);
    },
  },
  methods: {
    addMinutes(date, minutes) {
      return new Date(date.getTime() - minutes * 60000);
    },
  },
  created() {
    this.selectedTime = this.timeRange[0];
  },
};
</script>

<style lang="scss" scoped>
.currency-flag {
  width: 24px;
  height: 24px;
  margin: 5px;
  border-radius: 50%;
  background-position: center;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06) inset;
}
</style>