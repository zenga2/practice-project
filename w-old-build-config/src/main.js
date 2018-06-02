import Vue from 'vue'
import app from './app.vue'

const arr = [1234, 234, 325]
const find = arr.find(item => item === 1234)
console.log(find)

new Vue({
  el: '#app',
  template: '<app></app>',
  components: {app}
})
