import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currenciesList: [],
    pairValue: [],
  },
  mutations: {
    setCurrencyList(state, val) {
      state.currenciesList = []
      for (const key in val) {
        if (Object.hasOwnProperty.call(val, key)) {
          state.currenciesList.push({ 'name': val[key], value: key })
        }
      }
    },
    setPairValue(state, val) {
      state.pairValue = val.map(item => {return {val:item.close, label:item.date}})
    }
  },
  actions: {
    getAvailableLiveCurrencies(context) {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

      fetch(`${process.env.VUE_APP_API_URL}live_currencies_list?api_key=${process.env.VUE_APP_API_KEY}`, requestOptions)
        .then(response => response.json())
        .then((data) => {
          context.commit('setCurrencyList', data.available_currencies)
        })
        .catch(error => { return error });
    },
    getLiveRates(_, payload) {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

      return fetch(`${process.env.VUE_APP_API_URL}live?currency=${payload.currencies}&api_key=${process.env.VUE_APP_API_KEY}`, requestOptions)
        .then(response => response.json())
        .then(result => { return result })
        .catch(error => { return error });
    },
    getTimeseries(context, payload) {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      return fetch(`${process.env.VUE_APP_API_URL}timeseries?currency=${payload.currencies}&api_key=${process.env.VUE_APP_API_KEY}&start_date=${payload.startDate}&end_date=${payload.endDate}&format=records&interval=${payload.interval}&period=${payload.period}`, requestOptions)
        .then(response => response.json())
        .then(result => {
          context.commit('setPairValue', result.quotes)
          return this.state.pairValue
        })
        .catch(error => { return error });
    },

  },
  modules: {
  }
})
