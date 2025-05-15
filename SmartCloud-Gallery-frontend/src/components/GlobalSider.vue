<template>
  <div id="globalSider" >

    <div :class="['sticky-sider', { sticky: isSticky }]">
      <a-layout-sider   v-if="loginUserStore.loginUser.id" width="200"  v-model:collapsed="collapsed" collapsible theme="light">
<!--        <span @click="closeSider"><<</span>-->
        <a-menu v-model:selectedKeys="current" mode="inline" :items="menuItems" @click="doMenuClick" />
      </a-layout-sider>
    </div>

  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useTeamSpaceStore } from '@/stores/useTeamSpaceStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

const collapsed = ref<boolean>(false);
const loginUserStore = useLoginUserStore()

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队空间',
    icon: () => h(TeamOutlined),
  },
]


const teamSpaceStore = useTeamSpaceStore()
onMounted(async ()=>{
  await teamSpaceStore.fetchTeamSpaceList()
})

const menuItems = computed(() => {
  // 如果用户没有团队空间，则只展示固定菜单
  if (!Array.isArray(teamSpaceStore.teamSpaceList) || teamSpaceStore.teamSpaceList.length < 1) {
    return fixedMenuItems
  }
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceStore.teamSpaceList
    .filter(spaceUser => spaceUser.space?.spaceName)
    .map((spaceUser,index) => {

    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})
/**
 * 监听变量，改变时触发数据的重新加载
 */
watch(()=>teamSpaceStore.teamSpaceList?.length, ()=>{
  teamSpaceStore.fetchTeamSpaceList()
})


const router = useRouter()
// 当前要高亮的菜单项
const current = ref<string[]>([])
// 监听路由变化，更新高亮菜单项
router.afterEach((to, from, next) => {
  current.value = [to.path]
    if (to.path.startsWith('/my_space')) {
    current.value = ['/my_space']
  } else if (to.fullPath === '/add_space') {
    current.value = ['/my_space']
  } else if (to.fullPath === '/add_space?type=1') {
    // 创建团队空间
    console.log(to.path)
    console.log(to.fullPath)
    current.value = ['/add_space?type=' + SPACE_TYPE_ENUM.TEAM]
  }
})

// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push(key)
}
// 新增吸顶状态
const isSticky = ref(false)

// 滚动监听
const checkSticky = () => {
  isSticky.value = window.scrollY > 200
}

onMounted(() => {
  window.addEventListener('scroll', checkSticky)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkSticky)
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

/* 吸顶容器 */
.sticky-sider {
  background: white;
  transition: all 0.3s ease;
  padding: 0 20px;
}

/* 吸顶状态 */
.sticky-sider.sticky {
  position: fixed;
  top: 0;
  left: 0;
  height: 100% !important;
}

</style>
