<template>
  <div id="globalSider">
    <a-layout-sider v-if="loginUserStore.loginUser.id" width="200" breakpoint="lg" collapsed-width="0">
      <a-menu v-model:selectedKeys="current" mode="inline" :items="menuItems" @click="doMenuClick" />
    </a-layout-sider>
<!--    {{teamSpaceStore.teamSpaceList}}-->
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, ref, watch, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useTeamSpaceStore } from '@/stores/useTeamSpaceStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

const loginUserStore = useLoginUserStore()

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
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
  console.log('11111')
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  // 展示团队空间分组
  console.log('teamSpaceStore.teamSpaceList',teamSpaceStore.teamSpaceList)
  const teamSpaceSubMenus = teamSpaceStore.teamSpaceList
    .filter(spaceUser => spaceUser.space?.spaceName)
    .map((spaceUser,index) => {

    const space = spaceUser.space
    console.log('space',space,index)
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
// watchEffect( () => {
//   // 登录才加载
//   if (loginUserStore.loginUser.id) {
//     teamSpaceStore.fetchTeamSpaceList()
//     console.log('teamSpaceList',teamSpaceList)
//
//   }
//   // if (localStorage.getItem('spaceId')) {
//   //   console.log('创建了团队空间')
//   // }
// })

const router = useRouter()
// 当前要高亮的菜单项
const current = ref<string[]>([])
// 监听路由变化，更新高亮菜单项
router.afterEach((to, from, next) => {
  console.log('to.path',to.path)
  current.value = [to.path]
  // if (to.path.startsWith('/space/')) {
  //   // 我的空间
  //   current.value = ['/space/' + spaceUser.spaceId]
  // } else
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
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}
</style>
