<template>
  <div id="home-picture-list">
    <!-- 图片列表 -->
    <Waterfall
      v-if="pictureList.length > 0"
      :list="pictureList"
      :width="300"
      :breakpoints="breakpoints"
    >
      <template #default="{ item}">
        <a-card hoverable bordered @click="doClickPicture(item)">
          <template #cover>
            <div  >
              <LazyImg :url="item.url" />
            </div>
          </template>
          <a-card-meta
            :title="item.name"
            :description="`作者: ${item.user.userName}`"
            :bodyStyle="{ color: '#fff' }"
          >
            <template #avatar>
              <a-avatar size="large" v-if="item.user.userAvatar" :src="item.user.userAvatar" />
              <a-avatar size="large" v-else>
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
            </template>
          </a-card-meta>
        </a-card>
      </template>
    </Waterfall>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {UserOutlined, } from '@ant-design/icons-vue'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import { ref } from 'vue'

/**
 * 定义 Props 接口
 */
interface Props {
  pictureList?: API.PictureVO[]
  loading?: boolean
}

/**
 * 使用 defineProps 声明 props 并指定类型
 */
withDefaults(defineProps<Props>(), {
  pictureList: () => [],
  loading: false,
})

/**
 * 路由组件中的路由对象
 */
const router = useRouter()

/**
 * 瀑布流布局
 */
const breakpoints = ref({
  3000: {
    //当屏幕宽度小于等于3000
    rowPerView: 7, // 一行8图
  },
  1800: {
    rowPerView: 6,
  },
  1500: {
    rowPerView: 5,
  },
  1200: {
    rowPerView: 4,
  },
  1000: {
    rowPerView: 3,
  },
  800: {
    rowPerView: 2,
  },
  700: {
    rowPerView: 2,
  },
  500: {
    rowPerView: 1,
  },
  300: {
    rowPerView: 1,
  },
})

/**
 * 点击图片跳转到图片详情
 * @param picture
 */
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

</script>

<style scoped>
#home-picture-list {
  margin: 0 auto;
}

:deep(.ant-card-meta-title) {
  font-size: 16px;
  color: #696868;
}
</style>
