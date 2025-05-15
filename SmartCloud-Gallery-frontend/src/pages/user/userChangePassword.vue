<template>
  <div id="userChangePasswordPage">
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="oldPassword" :rules="[{ required: true, message: '请输入旧密码!' }]">
        <a-input-password v-model:value="formState.oldPassword" placeholder="请输入旧密码" />
      </a-form-item>

      <a-form-item
        name="newPassword"
        :rules="[
          { required: true, message: '请输入新密码!' },
          { min: 6, message: '密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码" />
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入确认密码!' },
          { min: 6, message: '确认密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">修改密码</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { changePasswordUsingPost, userLoginUsingPost, userRegisterUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['update:success'])

const formState = reactive<API.UserChangePasswordRequest>({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()
const handleSubmit = async (values: any) => {
  if (formState.newPassword !== formState.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  try {
    const res = await changePasswordUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      message.success('修改成功')
      console.log('1111')
      emit('success')
      formState.newPassword=''
      formState.oldPassword=''
      formState.checkPassword=''
    } else {
      message.error('修改失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('修改失败' + e.message)
  }
}

</script>

<style scoped lang="scss">
#userChangePasswordPage {
  padding-top: 20px;
  max-width: 360px;
  margin: 0 auto;
  .title {
    text-align: center;
    margin-bottom: 16px;
  }
  .tip {
    margin-bottom: 16px;
    color: #bbb;
    font-size: 13px;
    text-align: right;
  }
}
</style>
