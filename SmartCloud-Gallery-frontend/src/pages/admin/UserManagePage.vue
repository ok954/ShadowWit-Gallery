<template>
  <div id="userManagePage">
    <!--表单-->
    <a-form layout="inline" :model="searchParams" @finish="doSearch" ref="formRef" style="">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
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
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="120"></a-image>
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
         <a-space>
           <a-button type="link" @click="doEdit(record.id)">编辑</a-button>
           <a-popconfirm
             title="你确定要删除该用户?"
             ok-text="确认"
             cancel-text="取消"
             @confirm="confirm(record.id)"
           >
             <a-button danger @click="doDelete()">删除</a-button>
           </a-popconfirm>
           <a-popconfirm
             title="你确定要为该用户重置密码为111111?"
             ok-text="确认"
             cancel-text="取消"
             @confirm="confirmReset(record.id)"
           >
             <a-button  type="default">重置密码</a-button>
           </a-popconfirm>
         </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost, listUserVoByPageUsingPost, resetPasswordUsingPost } from '@/api/userController.ts'
import { type FormInstance, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const formRef = ref<FormInstance>()

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend', // ascend descend
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

// 获取数据
const fetchData = async () => {
  try {
    const res = await listUserVoByPageUsingPost({ ...searchParams })
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
  searchParams.userAccount = ''
  searchParams.userName = ''
  // if (formRef.value) {
  //   formRef.value.resetFields()
  // }
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
    const res = await deleteUserUsingPost({ id })
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

const router = useRouter()
// 编辑用户
const doEdit = (id) => {
  router.push({
    path: `/user/userInfo/${id}`,
  })
}

// 重置用户密码
const doReset = async (id: string) => {
  try {
    if (!id) {
      return
    }
    const res = await resetPasswordUsingPost({ id })
    if (res.data.code === 0) {
      message.success('重置密码成功')
    } else {
      message.error('重置密码失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('重置密码失败' + error.message)
  }
}

// 气泡确认框
const confirm = (id: string) => {
  doDelete(id)
}

const confirmReset = (id: string) => {
  doReset(id)
}
</script>
<style scoped lang="scss">
#userManagePage {
}
</style>
