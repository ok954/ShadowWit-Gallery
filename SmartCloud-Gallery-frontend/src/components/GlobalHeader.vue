<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <div @click="goToHome">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">影智云图库</div>
          </div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status" v-if="initialized">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar"></a-avatar>
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </a-space>

              <template #overlay>
                <a-menu>
                  <a-menu-item @click="gotoUserInfo"> <UserOutlined /> 个人中心 </a-menu-item>
                  <a-menu-item @click="gotoChangePassword"> <EditOutlined /> 修改密码 </a-menu-item>
                  <a-menu-item @click="openGitHub">
                    <!--                    <component :is="GiteeOutlined" />-->
                    <GithubOutlined />
                    项目地址
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
      <div class="modal-wrapper" @click="handleWrapperClick">
        <a-modal v-model:visible="open" title="修改密码" :footer="false" :mask-closable="true">
          <UserChangePassword @success="handleSuccess" />
        </a-modal>
      </div>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  GithubOutlined,
} from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController.ts'
import GiteeOutlined from '@/components/icons/GiteeOutlined.vue'
import UserChangePassword from '@/pages/user/userChangePassword.vue'

const loginUserStore = useLoginUserStore()

const initialized = ref<boolean>(false)

onMounted(async () => {
  await loginUserStore.fetchLoginUser()
  initialized.value = true
})

const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },

  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/user/about',
    label: '关于',
    title: '关于',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu.key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))

const router = useRouter()
// 当前要高亮的菜单项
const current = ref<string[]>([])
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}

// 用户注销
const doLogout = async () => {
  try {
    const res = await userLogoutUsingPost()
    if (res.data.code === 0 && res.data.data) {
      loginUserStore.setLoginUser({
        userName: '未登录',
      })
      message.success('退出登录成功')
      await router.push({
        path: '/user/login',
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      })
    } else {
      message.error('退出登录失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('退出登录失败' + e.message)
  }
}

// 去往个人中心
const gotoUserInfo = () => {
  router.push({
    path: '/user/userInfo',
  })
}

const openGitHub = () => {
  if (typeof window !== 'undefined') {
    window.open('https://github.com/ok954/smart-cloud-gallery', '_blank')
  }
}

// 前往首页

const goToHome = () => {
  router.push('/')
  window.scrollTo({ top: 0, behavior: 'smooth' }) // 平滑滚动到顶部
}

const open = ref<boolean>(false)
const gotoChangePassword = () => {
  open.value = true
}

const handleSuccess = () => {
  open.value = false
}
</script>

<style scoped lang="scss">
#globalHeader {
  .title-bar {
    display: flex;
    align-items: center;
    cursor: pointer;

    .title {
      font-size: 18px;
      color: #000;
      margin-left: 16px;
    }

    .logo {
      margin-left: 30px;
      height: 48px;
    }
  }
}
</style>
