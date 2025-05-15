<template>
  <div id="app">
    <a-config-provider :locale="locale">
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

<style >

:global(.ant-message) {
  z-index: 999999 !important;
}
</style>
