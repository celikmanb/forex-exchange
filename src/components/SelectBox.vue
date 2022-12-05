<template>
  <v-select
    :items="items"
    :label="label"
    outlined
    item-text="name"
    item-value="value"
    v-model="selected"
    @change="selectedCur"
  ></v-select>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
    },
    label: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      selected: {},
    };
  },
  watch: {
    items(val) {
      this.selected = val.length > 0 ? val[0] : {};
      this.$emit("selectedCurrency", this.selected?.value);
    },
  },
  methods: {
    selectedCur(val) {
      this.$emit("selectedCurrency", val);
    },
  },
  mounted() {},
};
</script>

<style>
</style>