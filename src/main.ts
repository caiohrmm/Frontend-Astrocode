import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import { pinia } from './app/store'
import vuetify from './plugins/vuetify'
import './style.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
