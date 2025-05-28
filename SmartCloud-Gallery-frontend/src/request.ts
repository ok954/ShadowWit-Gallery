import axios from 'axios'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

// 区分开发和生产环境
// alert(process.env.NODE_ENV);
console.log(process.env.NODE_ENV)

const myAxios = axios.create({
  // 区分开发和线上环境
  baseURL:
    process.env.NODE_ENV === 'development' ? 'http://localhost:8123' : 'http://121.41.49.251',
  timeout: 10000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 阻止某些路由下请求 spaceUser/list/my 接口
    // 这个接口会显示侧边栏，登录注册页面不需要
    const forbiddenPaths = ['/user/login', '/user/register']
    const currentPath = window.location.pathname
    const loginUserStore = useLoginUserStore()
    // console.log('loginUserStore', loginUserStore.loginUser)
    const token = loginUserStore.loginUser?.token
    if (token) {
      // console.log('token', token)
      config.headers.Authorization = token
    }

    if (forbiddenPaths.includes(currentPath) && config.url?.includes('spaceUser/list/my')) {
      return Promise.reject(new Error('当前页面不允许发送该请求'))
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        // 不是登录接口
        !response.request.responseURL.includes('user/get/login') &&
        //  不是用户登录页面
        !window.location.pathname.includes('/user/login') &&
        //  不是首页
        !window.location.pathname === '/'
      ) {
        message.warning('请先登录')
        console.log('window.location.href', window.location.href)
        //http://localhost:5173/user/login?redirect=http://localhost:5173/
        // window.location.href = `/user/login?redirect=${window.location.href}`
        window.location.href = `/user/login`
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios
