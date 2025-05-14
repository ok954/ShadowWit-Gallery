// 主要是为了解决侧边栏团队空间的bug，
// bug1侧边栏团队空间的原本设计是登录的时候刷新团队空间
// bug2空间管理删除后，由于后端原因，只是进行了逻辑删除，并没有真正删除，
// 不知道怎么改后端选择把团队空间是否存在的逻辑写在前端
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

export const useTeamSpaceStore = defineStore('teamSpace', () => {
  const teamSpaceList = ref<API.SpaceUserVO[]>([])

  // 加载团队空间列表
async function fetchTeamSpaceList()  {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}


  function setTeamSpaceList(newTeamSpaceList: any) {
    teamSpaceList.value = newTeamSpaceList
  }

  // function deleteTeamSpace(teamSpaceId: number) {
  //   teamSpaceList.value = teamSpaceList.value.filter(teamSpace => teamSpace.id !== teamSpaceId)
  // }

  return { teamSpaceList,fetchTeamSpaceList,setTeamSpaceList }
})
