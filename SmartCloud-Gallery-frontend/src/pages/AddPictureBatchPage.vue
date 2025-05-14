<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建图片</h2>

    <!-- 图片信息表单 -->
    <a-form name="formData" layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item name="name" label="关键词">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="抓取数量">
        <a-input-number v-model:value="formData.count" placeholder="请输入数量" :min="1" :max="30" style="min-width: 180px"
          allow-clear />
      </a-form-item>
      <a-form-item name="category" label="名称前缀">
        <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补全" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" html-type="submit" style="width: 100%">执行任务</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'

const router = useRouter()

const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})
const loading = ref<boolean>(false)

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  try {
    const res = await uploadPictureByBatchUsingPost({
      ...formData,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(`执行成功，共${res.data.data}条`)
      await router.push({
        path: `/`,
      })
    } else {
      message.error('执行失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('执行失败，请求超时，可以重新执行或者减少数量')
    message.error(error.message)
  }
  loading.value = false
}
</script>
<style scoped lang="scss">
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
