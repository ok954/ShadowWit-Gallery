<template>
  <div id="userLoginPage">
    <h2 class="title">影智云图库 - 用户登录</h2>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入用户名!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码!' },
          { min: 6, message: '密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <div class="tip">
        没有账号?
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      const redirect = (router.currentRoute.value.query.redirect as string) || '/'
      // console.log(redirect,'redirect')
      // alert(redirect)
      await router.push({
        path: redirect,
        replace: true,
      })
    } else {
      message.error('登录失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('登录失败' + error.message)
  }
}
</script>

<style scoped lang="scss">
#userLoginPage {
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
