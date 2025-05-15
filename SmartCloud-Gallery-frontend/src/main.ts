import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import 'ant-design-vue/dist/reset.css'
import '@/access.ts'

import { message } from 'ant-design-vue'

const app = createApp(App)
app.use(Antd)

// 设置全局 message 配置
message.config({
  top: '35px',       // 可选：设置距离顶部位置
  duration: 3,        // 可选：显示时间
  maxCount: 3,        // 可选：最多显示几条消息
  getContainer: () => document.body,
  zIndex: 100000,     // 关键：设置一个足够大的 z-index 值
})


app.use(createPinia())
app.use(router)
app.use(VueCropper)

app.mount('#app')

