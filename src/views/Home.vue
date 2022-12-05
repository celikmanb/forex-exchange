<template>
  <div>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="128"
        >Loading...</v-progress-circular
      >
    </v-overlay>
    <v-container>
      <h1 class="font-weight-black" style="font-size: 3rem">Forex Exchange</h1>
      <p>Check out the current price for a currency pair</p>
      <v-row>
        <v-col cols="12" md="3" align-self="center">
          <select-box
            :items="$store.state.currenciesList"
            @selectedCurrency="selectedCurrency($event, 1)"
          />
          <select-box
            :items="$store.state.currenciesList"
            @selectedCurrency="selectedCurrency($event, 2)"
          />
        </v-col>
        <v-col cols="12" md="9" align-self="center">
          <chart-box
            :chartData="chartData"
            :currentRate="currentRate ? currentRate : {}"
            :currencyText="fullCurrencyText"
            @currentTime="selectedRange"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapActions } from "vuex";
//components
import SelectBox from "../components/SelectBox.vue";
import ChartBox from "../components/ChartBox.vue";

export default {
  name: "Home",
  components: {
    SelectBox,
    ChartBox,
  },
  data() {
    return {
      currentRate: {},
      currencyTextFirst: "",
      currencyTextSecond: "",
      startDate: this.formatDate(new Date()),
      endDate: this.formatDate(new Date()),
      formatOptions: {
        interval: "minute",
        period: "1",
      },
      availableHistoric: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: this.fullCurrencyText,
            backgroundColor: "rgb(242 249 234)",
            pointBackgroundColor: "rgb(116 193 3)",
            borderColor: "rgb(116 193 3)",
            fill: true,
            data: [],
          },
        ],
      },
      overlay: false,
      reconnectInterval: 1000 * 10,
      socket: null
    };
  },
  computed: {
    fullCurrencyText() {
      return this.currencyTextFirst + "/" + this.currencyTextSecond;
    },
    startFormatDate() {
      return this.startDate.split(" ")[0] + "-" + this.startDate.split(" ")[1];
    },
    endFormatDate() {
      return this.endDate.split(" ")[0] + "-" + this.endDate.split(" ")[1];
    },
  },
  methods: {
    ...mapActions([
      "getAvailableLiveCurrencies",
      "getLiveRates",
      "getTimeseries",
    ]),
    padTo2Digits(num) {
      return num.toString().padStart(2, "0");
    },
    formatDate(date) {
      // it will given -1 for day cause that API doesn't give today value
      return (
        [
          date.getFullYear(),
          this.padTo2Digits(date.getMonth() + 1),
          this.padTo2Digits(date.getDate() - 1),
        ].join("-") +
        " " +
        [
          this.padTo2Digits(date.getHours()),
          this.padTo2Digits(date.getMinutes()),
          // this.padTo2Digits(date.getSeconds()),
        ].join(":")
      );
    },

    async getCurrencyList() {
      this.overlay = true;
      await this.getAvailableLiveCurrencies();
      this.overlay = false;
    },
    async setCurrencyChange() {
      this.overlay = true;
      let params = {
        currencies: this.currencyTextFirst + this.currencyTextSecond,
        startDate: this.endFormatDate,
        interval: this.formatOptions?.interval,
        period: this.formatOptions?.period,
        endDate: this.startFormatDate,
      };
      this.currentRate = await this.getLiveRates(params);
      this.currentRate = this.currentRate?.quotes[0];
      let resData = await this.getTimeseries(params);
      this.sendSocketMessage()
      console.log("res data", resData);
      this.chartData.datasets[0].data = this.$store.state.pairValue.map(
        (item) => item.val
      );
      this.chartData.datasets[0].label = this.fullCurrencyText;
      this.chartData.labels = this.$store.state.pairValue.map(
        (item) => item.label
      );
      this.overlay = false;
    },
    checkControlRequest() {
      if (
        this.currencyTextFirst.length > 0 &&
        this.currencyTextSecond.length > 0
      ) {
        this.setCurrencyChange();
      }
    },
    selectedCurrency(val, param) {
      if (!val) return;
      if (param == 1) {
        this.currencyTextFirst = val;
      } else {
        this.currencyTextSecond = val;
      }
      this.checkControlRequest();
    },
    selectedRange(val) {
      if (!val) return;
      this.endDate = this.formatDate(val?.date);
      this.formatOptions = val;
      this.checkControlRequest();
    },
    sendSocketMessage() {
      this.socket.send(`{"userKey":"${process.env.VUE_APP_SOCKET_KEY}", "symbol":"${this.currencyTextFirst+this.currencyTextSecond}"}`);
    },
    initSocket() {
      var self = this
      
      this.socket = new WebSocket("wss://marketdata.tradermade.com/feedadv");

      this.socket.onopen = () => {
        self.socket.send(`{"userKey":"${process.env.VUE_APP_SOCKET_KEY}", "symbol":"${self.currencyTextFirst+self.currencyTextSecond}"}`);
      }

      this.socket.onclose = () => {
        console.log("socket close : will reconnect in " + self.reconnectInterval);
        setTimeout(self.initSocket, self.reconnectInterval);
      }

      this.socket.onerror = function(event) {
        console.log("socket error : ", event);
      }

      this.socket.onmessage = (event) => {
        if (typeof event?.data == Object) {
          let receiveData = JSON.parse(event?.data)
          if (receiveData) {
            self.currentRate = receiveData
          }
        }
      }
    },
  },
  mounted() {
    this.initSocket()
    this.getCurrencyList();
  },
};
</script>
