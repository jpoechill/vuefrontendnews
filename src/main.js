// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import Work from './components/Work.vue'
import BootstrapVue from 'bootstrap-vue'
import InfiniteLoading from 'vue-infinite-loading'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/css/bootstrap.css'
import VueCookie from 'vue-cookie'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(InfiniteLoading)
Vue.use(VueCookie)
Vue.use(BootstrapVue)
/* eslint-disable no-new */

const routes = [
  { path: '/', component: Work },
  { path: '/:pagename', component: Work }
]

const router = new VueRouter({
  mode: 'history',
  history: true,
  routes,
  saveScrollPosition: true
})

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
