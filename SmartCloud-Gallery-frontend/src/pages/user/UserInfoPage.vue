<template>
  <div id="userInfo">
    <h2 style="margin-bottom: 16px">
      {{ isEditUser === true ? '编辑用户' : '个人中心' }}
    </h2>
    <!-- 用户信息表单 -->
    <a-form name="userForm" layout="vertical" :model="userForm" @finish="handleSubmit">
      <a-form-item name="userAvatar" label="">
        <PictureUpload :imgUrl="userForm.userAvatar" :onSuccess="onSuccess" msg="上传头像" />
      </a-form-item>

      <a-form-item name="userName" label="名称">
        <a-input v-model:value="userForm.userName" allow-clear />
      </a-form-item>
      <a-form-item name="userProfile" label="用户简介">
        <a-textarea v-model:value="userForm.userProfile" :auto-size="{ minRows: 2, maxRows: 5 }" allow-clear />
      </a-form-item>
      <a-form-item name="userRole" label="用户角色">
        <a-auto-complete :disabled="isAdmin" v-model:value="userForm.userRole" :options="userRoleOptions" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">修改</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { updateUserUsingPost, getUserByIdUsingGet } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

const picture = ref<API.PictureVO>()
// 判断是不是管理员在编辑用户
const isEditUser = computed<boolean>(() => {
  // id存在，是从用户管理处来的，且如果id等于自身，不是编辑用户，是个人中心
  if (route.params.id && String(route.params.id) !== String(loginUserStore.loginUser.id)) {
    return true
  }
  return false
})

const userForm = reactive<API.UserUpdateRequest>(
  isEditUser.value
    ? {
      userAvatar: '',
      userName: '',
      userProfile: '',
      userRole: '',
      id: Number(route.params.id),
    }
    : {
      userAvatar: loginUserStore.loginUser.userAvatar,
      userName: loginUserStore.loginUser.userName,
      userProfile: loginUserStore.loginUser.userProfile,
      userRole: loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '用户',
      id: Number(loginUserStore.loginUser.id),
    },
)

// 监听 route.params.id 变化
watch(
  () => route.params.id,
  async (newId) => {
    // 重新计算 isEditUser
    const editMode = Boolean(newId) && newId !== ''

    // 更新 userForm
    if (editMode) {
      Object.assign(userForm, {
        userAvatar: '',
        userName: '',
        userProfile: '',
        userRole: '',
        id: Number(newId),
      })
    } else {
      Object.assign(userForm, {
        userAvatar: loginUserStore.loginUser.userAvatar,
        userName: loginUserStore.loginUser.userName,
        userProfile: loginUserStore.loginUser.userProfile,
        userRole: loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '用户',
        id: Number(loginUserStore.loginUser.id),
      })
    }

    // 重新获取用户信息
    await fetchUserInfo()
  },
)

const userRoleOptions = [
  {
    value: '用户',
    label: '用户',
  },
  {
    value: '管理员',
    label: '管理员',
  },
]

// 判断是不是管理员
const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'user'
})

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  userForm.userAvatar = newPicture.url
}

/**
 * 提交表单 分为管理员给用户修改和用户自身修改
 * @param values
 */
const handleSubmit = async (values: any) => {
  try {
    const res = await updateUserUsingPost({
      id: isEditUser.value ? route.params.id : loginUserStore.loginUser.id,
      ...values,
      userRole: userForm.userRole === '管理员' ? 'admin' : 'user',
    })
    if (res.data.code === 0 && res.data.data) {
      // 用户自身修改
      if (!isEditUser.value) {
        loginUserStore.setLoginUser({
          ...loginUserStore.loginUser,
          id: isEditUser.value ? route.params.id : loginUserStore.loginUser.id,
          ...values,
          userRole: userForm.userRole === '管理员' ? 'admin' : 'user',
        })
      }
      // 管理员修改不需要提交到store

      message.success('修改成功')
      const path = isEditUser.value ? `/admin/userManage` : '/'
      await router.push({
        path,
      })
    } else {
      message.error('修改失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('修改失败' + error.message)
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  // 如果是个人中心，那么从store中获取用户信息
  if (!isEditUser.value) {
    userForm.userAvatar = loginUserStore.loginUser.userAvatar
    userForm.userName = loginUserStore.loginUser.userName
    userForm.userProfile = loginUserStore.loginUser.userProfile
    userForm.userRole = loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '用户'
    return
  }
  // 如果是管理员给用户修改，那么从接口中获取用户信息
  try {
    const res = await getUserByIdUsingGet({
      id: route.params.id ?? loginUserStore.loginUser.id,
    })
    if (res.data.code === 0 && res.data.data) {
      userForm.userAvatar = res.data.data.userAvatar
      userForm.userName = res.data.data.userName
      userForm.userProfile = res.data.data.userProfile
      userForm.userRole = res.data.data.userRole === 'admin' ? '管理员' : '用户'
    } else {
      message.error('获取用户信息失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取用户信息失败', e.message)
  }

}

onMounted(() => {
  if (!loginUserStore.loginUser.id) {
    message.error('请先登录')
    router.push('/login')
    return
  }
  fetchUserInfo()
})
</script>
<style scoped lang="scss">
#userInfo {
  max-width: 720px;
  margin: 0 auto;
}
</style>
