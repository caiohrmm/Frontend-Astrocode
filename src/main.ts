import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import { pinia } from './app/store'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './app/store/auth.store'
import './style.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

// Initialize auth store on app start
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
