import { createApp } from 'vue'
import { Notify, Quasar } from 'quasar'
import quasarIconSet from 'quasar/icon-set/svg-material-icons'
import router from './router'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'

createApp(App)
  .use(Quasar, {
    plugins: { Notify }, // import Quasar plugins and add here
    iconSet: quasarIconSet
  })
  .use(router)
  .mount('#app')
