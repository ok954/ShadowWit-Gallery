<template>
  <div id="PictureManagePage">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-space>
        <a-button type="primary" href="/add_picture" >+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch"  ghost>
          + 批量创建图片
        </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <!--表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" ref="formRef">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParams.category" placeholder="输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签">
        <a-input
          v-model:value="searchParams.tags"
          placeholder="输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="reviewStatus" label="审核状态">
        <a-select
          v-model:value="searchParams.reviewStatus"
          style="min-width: 180px"
          placeholder="请选择审核状态"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 20px"></div>
    <!-- 表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120"></a-image>
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">
              {{ tag }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div>审核人：{{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              type="link"
              @click="showModal(record, PIC_REVIEW_STATUS_ENUM.PASS)"
            >
              通过
            </a-button>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link"
              danger
              @click="showModal(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
            >
              拒绝
            </a-button>
            <a-button type="link" :href="`/add_picture?id=${record.id}`" >
              编辑
            </a-button>
            <a-popconfirm
              title="你确定要删除该图片?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="confirm(record.id)"
            >
              <a-button danger @click="doDelete()">删除</a-button>
            </a-popconfirm>
            <a-modal
              v-model:open="open"
              title="原因"
              ok-text="确认"
              cancel-text="取消"
              @ok="handleOk"
              :mask="false"
              :maskClosable="false"
            >
              <a-textarea
                v-model:value="msg"
                placeholder="请输入原因"
                :auto-size="{ minRows: 2, maxRows: 5 }"
                allow-clear
              />
            </a-modal>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/PictureController.ts'
import { type FormInstance, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture.ts'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'PictureId',
    width: 80,
  },
  {
    title: '空间 id',
    dataIndex: 'spaceId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const formRef = ref<FormInstance>()
const reviewStatus = ref<number>(0)
const msg = ref<string>('')
const picture = reactive<API.Picture>({
  id: '',
  name: '',
  introduction: '',
  category: '',
  reviewMessage: '',
})

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend', // ascend descend
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

const reviewMessage = computed(() =>
  reviewStatus.value === 1 ? '管理员操作通过' : '管理员操作拒绝',
)

// 获取数据
const fetchData = async () => {
  try {
    const res = await listPictureByPageUsingPost({ ...searchParams })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取用户列表失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取用户列表失败' + error.message)
  }
}

// 表单搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 重置表单
const resetForm = () => {
  searchParams.searchText = ''
  searchParams.category = ''
  searchParams.tags = []
  searchParams.reviewStatus = null
  doSearch()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 删除数据
const doDelete = async (id: string) => {
  try {
    if (!id) {
      return
    }
    const res = await deletePictureUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('删除失败' + error.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  // let reviewMessage =
  //   reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  // let reviewMessage = record.reviewMessage
  // const res = await doPictureReviewUsingPost({
  //   id: record.id,
  //   reviewStatus,
  //   reviewMessage,
  // })
  // if (res.data.code === 0) {
  //   message.success('审核操作成功')
  //   // 重新获取列表数据
  //   fetchData()
  // } else {
  //   message.error('审核操作失败，' + res.data.message)
  // }
}

const open = ref<boolean>(false)

const showModal = (record: API.Picture, status: number) => {
  reviewStatus.value = status
  picture.value = record
  open.value = true
}

const handleOk = async () => {
  console.log(picture.value.name)
  // let reviewMessage = picture.reviewMessage
  const res = await doPictureReviewUsingPost({
    id: picture.value.id,
    reviewStatus: reviewStatus.value,
    reviewMessage: Boolean(msg.value) ? msg.value : reviewMessage.value,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表数据
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }

  open.value = false
}

// 气泡确认框
const confirm = (id: string) => {
  doDelete(id)
}
</script>
<style scoped lang="scss">
#PictureManagePage {
}
</style>
