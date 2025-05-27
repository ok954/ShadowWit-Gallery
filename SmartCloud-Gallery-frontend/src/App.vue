<template>
  <div id="app">
    <a-config-provider :locale="locale">
      <h2 class="title">影智云图库</h2>
      <BasicLayout></BasicLayout>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
const locale = zhCN
</script>

<style scoped>
.title {
  position: fixed;
  opacity: 0;
}
</style>
