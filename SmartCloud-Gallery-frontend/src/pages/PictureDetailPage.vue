<template>
  <div id="pictureDetailPage">
    {{isAdmin}}
    <a-row :gutter="[16, 16]">
      <!--      图片预览-->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image :src="picture.url" style="max-height: 600px; object-fit: contain"></a-image>
        </a-card>
      </a-col>
      <!--图片信息-->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture.picColor ?? '-' }}
                <div v-if="picture.picColor" :style="{
                  width: '16px',
                  height: '16px',
                  backgroundColor: toHexColor(picture.picColor),
                }" />
              </a-space>
            </a-descriptions-item>
            <!--   团队中不需要审核-->
            <a-descriptions-item label="审核状态" v-if="isAdmin || !canEdit1">
              <a-tag :color="PIC_REVIEW_STATUS_MAP[picture.reviewStatus] === PIC_REVIEW_STATUS_MAP[PIC_REVIEW_STATUS_ENUM.PASS] ? 'green' : 'red'">
                {{ PIC_REVIEW_STATUS_MAP[picture.reviewStatus] }}
              </a-tag>
<!--              {{  }}-->
            </a-descriptions-item>
            <a-descriptions-item label="审核信息" v-if="isAdmin || !canEdit1">
              {{ picture.reviewMessage }}
            </a-descriptions-item>
          </a-descriptions>
          <!-- 图片操作 -->
          <a-space wrap>
            <a-button type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button :icon="h(ShareAltOutlined)" type="primary" ghost @click="doShare">
              分享
            </a-button>
            <a-button v-if="canEdit1 || canEdit" :icon="h(EditOutlined)" type="default" @click="doEdit">
              编辑
            </a-button>
            <a-popconfirm title="你确定要删除该图片?" ok-text="确认" cancel-text="取消" @confirm="confirm()">
              <a-button v-if="canEdit || canDelete" :icon="h(DeleteOutlined)" danger>
                删除
              </a-button>
            </a-popconfirm>
            <!--仅管理员可见的操作按钮-->
            <!-- 团队中不需要审核-->
            <a-button v-if="isAdmin && picture.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS" type="default"
              @click="showModal(picture, PIC_REVIEW_STATUS_ENUM.PASS)">
              通过
            </a-button>
            <a-button v-if="isAdmin && picture.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="default" danger @click="showModal(picture, PIC_REVIEW_STATUS_ENUM.REJECT)">
              拒绝
            </a-button>
            <a-modal v-model:open="open" title="原因" ok-text="确认" cancel-text="取消" @ok="handleOk" :mask="false"
              :maskClosable="false">
              <a-textarea v-model:value="msg" placeholder="请输入原因" :auto-size="{ minRows: 2, maxRows: 5 }" allow-clear />
            </a-modal>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
// 数据
import { computed, onMounted, ref, h, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost, getPictureByIdUsingGet
} from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { DeleteOutlined, EditOutlined, ShareAltOutlined,DownloadOutlined } from '@ant-design/icons-vue'
import { downloadImage, formatSize, toHexColor } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_MAP } from '@/constants/picture.ts'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'

interface Props {
  id: string | number
}
const props = defineProps<Props>()

const loginUserStore = useLoginUserStore()
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 非登录不可编辑
  if (!loginUser.id) {
    return false
  }
  // 仅本人或管理员可以编辑
  const user = picture.value?.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})

// 判断是不是管理员
const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 通用权限检查函数, 这是团队的权限
function createPermissionChecker(permission: string) {
  return computed(() => {
    // console.log('全部权限', picture.value.permissionList)
    // console.log('是否包含', permission)
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit1 = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

//获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
      picture.value.tags = JSON.parse( picture.value.tags)
    } else {
      message.error('获取图片详情失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

const router = useRouter()

// 编辑
const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}

// 删除数据
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  try {
    const res = await deletePictureUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 回到上一个页面
      router.go(-1)
    } else {
      message.error('删除失败')
    }
  } catch (e: any) {
    message.error('删除失败', e.message)
  }
}

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url, picture.value.name)
}

// 审核
const open = ref<boolean>(false)
const msg = ref<string>('')
const picture = ref<API.Picture>({})


const showModal = (record: API.Picture, status: number) => {

  params.reviewStatus = status
  picture.value = record
  params.id = picture.value.id
  msg.value=''
  open.value = true
}


let params = reactive({
  id: '',
  reviewStatus: '',
  reviewMessage: '' ,
})


const handleOk = async () => {
  if(msg.value===''){
     params.reviewMessage = (params.reviewStatus === 1 ? '管理员操作通过' : '管理员操作拒绝')
  }
  if(msg.value){
    params.reviewMessage = msg.value
  }
  const res = await doPictureReviewUsingPost({
    id:params.id,
    reviewStatus:params.reviewStatus,
    reviewMessage:params.reviewMessage
  })
  if (res.data.code === 0) {

    message.success('审核操作成功')
    // reviewStatus.value=''
    // 重新获取列表数据
    fetchPictureDetail()
  } else {

    message.error('审核操作失败，' + res.data.message)
  }
  open.value = false

}

// 气泡确认框
const confirm = () => {
  doDelete()
}

// ----- 分享操作 ----
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped lang="scss">
#pictureDetailPage {}
</style>
