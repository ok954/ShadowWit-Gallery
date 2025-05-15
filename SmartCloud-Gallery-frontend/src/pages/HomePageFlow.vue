<template>

  <div id="homePage">
    <!-- 搜索框 -->
    <div :class="['sticky-header', { sticky: isSticky, hidden: isSearchHidden }]" ref="searchRef">

    <div class="search-bar">
        <a-input-search
          v-model:value="searchParams.searchText"
          placeholder="从海量图片中搜索"
          enter-button="搜索"
          size="large"
          @search="doSearch"
          class="logo-search"
        />

      </div>
      <!-- 分类和标签筛选 -->
      <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
      </a-tabs>

    </div>



    <!-- 占位元素 -->
    <div v-if="isSticky" class="sticky-placeholder"></div>
    <!-- 图片列表 -->
    <div v-if="homeLoading" class="loading-spinner">
      <a-spin size="large" tip="加载中..." />
    </div>
    <div v-else>
      <!-- 图片列表 -->
      <PictureFlowList
        :pictureList="homePictureList"
        :loading="homeLoading"
      />

      <!-- 加载信息 -->
      <div class="loadingInfo">
        <a-spin v-if="homeLoading" size="large" />
        <div v-if="showBottomLine">
          <a-divider v-if="homePictureList.length > 0" style="color: #666666">
            图片到底了...
          </a-divider>
          <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </div>
    </div>

    </div>
</template>

<script setup lang="ts">


// 数据
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Empty, message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import PictureFlowList from '@/components/PictureFlowList.vue'
import { EyeOutlined } from '@ant-design/icons-vue'


defineOptions({ name: 'HomePageFlow' })
const homePictureList = ref<API.Picture[]>([])
/**
 * 加载变量状态
 */
const homeLoading = ref(true)
/**
 * 加载完成状态
 */
const loadingFinish = ref(false)
/**
 * 控制底线显示
 */
const showBottomLine = ref(false)

// 新增吸顶状态
const isSticky = ref(false)

// 滚动监听
const checkSticky = () => {
  isSticky.value = window.scrollY > 100
}

/**
 * 初始化页面
 */
onMounted(() => {
  window.addEventListener('scroll', checkSticky)
  // 延迟执行初始图片加载，确保DOM已准备好

  window.addEventListener('scroll', handleScrollDebounced)
})

/**
 * 卸载页面
 */
onUnmounted(() => {
  window.removeEventListener('scroll', checkSticky)
  window.removeEventListener('scroll', handleScrollDebounced)
})

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})


const loadingLock = ref(false)
// 获取数据
const fetchData = async () => {
  if (loadingFinish.value || loadingLock.value) return // 如果已经加载完毕，直接返回
  loadingLock.value = true
  try {
    const params = { ...searchParams, tags: [] as string[] }
    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }
    selectedTagList.value.forEach((useTag, index) => {
      if (useTag) {
        params.tags.push(tagList.value[index])
      }
    })
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code === 0 && res.data.data) {

      const newRecords = res.data.data.records || []
      homePictureList.value = [...homePictureList.value, ...newRecords]
      checkPageHeight()
      // 判断是否没有更多数据
      if (newRecords.length < searchParams.pageSize) {
        loadingFinish.value = true // 没有更多数据了
        window.removeEventListener('scroll', handleScrollDebounced) // 移除滚动监听

        // 延迟 1 秒后显示底线
        setTimeout(() => {
          showBottomLine.value = true
        }, 1000)
      } else {
        // 检查页面高度是否小于屏幕高度
        checkPageHeight()
      }
    } else {
      message.error('获取用户列表失败' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取用户列表失败' + error.message)
  }finally {
    homeLoading.value = false
    loadingLock.value = false
  }
}

onMounted(() => {
  fetchData()
})

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 搜索
const doSearch = () => {
  homeLoading.value = true
  // 重置搜索条件
  searchParams.current = 1
  // 处理分类
  if (selectedCategory.value !== 'ALL') {
    searchParams.categoryId = selectedCategory.value
  } else {
    searchParams.categoryId = undefined
  }
  loadingFinish.value = false
  showBottomLine.value = false
  homePictureList.value = []
  fetchData()
}




/**
 * 获取标签和分类选项
 */
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagList.value = res.data.data.tagList ?? []
      categoryList.value = res.data.data.categoryList ?? []
    } else {
      message.error('获取标签和分类选项失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取标签和分类选项失败' + e.message)
  }
}
onMounted(() => {
  getTagCategoryOptions()
})

/**
 * 检查页面高度是否小于屏幕高度
 */
const checkPageHeight = () => {
  // 延迟检查，确保DOM更新完成
  setTimeout(() => {
    const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    const clientHeight =
      window.innerHeight ||
      Math.min(document.documentElement.clientHeight, document.body.clientHeight)

    if (scrollHeight <= clientHeight && !loadingFinish.value) {
      searchParams.current++
      fetchData()
    }
  }, 300)
}
/**
 * 滚动加载
 */
const handleScroll = () => {
  if (loadingFinish.value || homeLoading.value) return
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const scrollTop =
    window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight =
    window.innerHeight ||
    Math.min(document.documentElement.clientHeight, document.body.clientHeight)

  // 增加更严格的判断条件
  if (scrollHeight - (clientHeight + scrollTop) < 50) {
    searchParams.current++
    fetchData()
  }
}
/**
 * 防抖函数
 */
const debounce = (fn, delay) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
// 在setup外部定义防抖函数
const handleScrollDebounced = debounce(handleScroll, 200)

// 去除搜索框
const searchRef = ref()

const isSearchHidden = ref(false)

const toggleSearch = () => {
  isSearchHidden.value = !isSearchHidden.value
}

</script>

<style scoped lang="scss">


#homePage {
  .search-bar {
    max-width: 480px;
    margin: 0 auto 16px;
  }
  .search-bar {
    max-width: 480px;
    margin: 0 auto 16px;
  }
  .tag-bar {
    margin-bottom: 16px;
  }
  /* 吸顶容器 */
  .sticky-header {
    background: white;
    transition: all 0.3s ease;
    padding: 0 20px;
  }
  .sticky-header.sticky {
    height: 150px;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 800;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    //display: none;
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 100% !important;
  }

  /* 占位元素 */
  .sticky-placeholder {
    height: calc(50px + 46px + 48px); /* logo高度 + 搜索框高度 + 标签高度 + 间距 */
  }

  /* 分类标签样式 */
  :deep(.ant-tabs) {
    max-width: 800px;
    margin: 0 auto;
  }
  /* 调整后的搜索框 */
  .logo-search {
    flex: 1;
    padding-top: 20px;
    max-width: 700px;
  }

  .logo-search :deep(.ant-input) {
    border-radius: 24px 0 0 24px !important;
    height: 46px;
    font-size: 16px;
    border-color: #d9d9d9;
  }

  .logo-search :deep(.ant-input:hover),
  .logo-search :deep(.ant-input:focus) {
    border-color: #4096ff;
  }

  .logo-search :deep(.ant-input-group-addon .ant-btn) {
    border-radius: 0 24px 24px 0 !important;
    height: 46px;
    width: 90px;
    background-color: #4096ff;
    color: white;
    border-color: #4096ff;
  }

  .logo-search :deep(.ant-input-group-addon .ant-btn:hover) {
    background-color: #1677ff;
    border-color: #1677ff;
  }

  /* 分类标签样式 */
  :deep(.ant-tabs) {
    max-width: 800px;
    margin: 0 auto;
  }

  :deep(.ant-tabs-nav) {
    margin: 0;
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 16px;
    font-size: 15px;
    color: #666;
    transition: all 0.2s;
  }

  :deep(.ant-tabs-tab:hover) {
    color: #4096ff;
  }

  :deep(.ant-tabs-tab-active) {
    color: #4096ff;
    font-weight: 500;
  }

  :deep(.ant-tabs-ink-bar) {
    background: #4096ff;
    height: 3px;
  }


}

.loadingInfo {
  text-align: center;
  padding: 30px 50px;
  margin: 20px 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
