<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />

      </a-layout-header>
      <a-layout>
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
          <div style="margin-bottom: 48px"></div>
        </a-layout-content>
      </a-layout>
      <!-- <a-layout-footer class="footer" :class="{ 'show-footer': isFooterVisible }">
        <a-tooltip placement="top">
          <template #title>Gitee</template>
          <a href="https://gitee.com/gyx915/smart-cloud-gallery" target="_blank">

            <svg t="1747203091049" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="2809" width="16" height="16">
              <path
                d="M512 1024C229.2224 1024 0 794.7776 0 512S229.2224 0 512 0s512 229.2224 512 512-229.2224 512-512 512z m259.1488-568.8832H480.4096a25.2928 25.2928 0 0 0-25.2928 25.2928l-0.0256 63.2064c0 13.952 11.3152 25.2928 25.2672 25.2928h177.024c13.9776 0 25.2928 11.3152 25.2928 25.2672v12.6464a75.8528 75.8528 0 0 1-75.8528 75.8528H366.592a25.2928 25.2928 0 0 1-25.2672-25.2928v-240.1792a75.8528 75.8528 0 0 1 75.8272-75.8528h353.9456a25.2928 25.2928 0 0 0 25.2672-25.2928l0.0768-63.2064a25.2928 25.2928 0 0 0-25.2672-25.2928H417.152a189.6192 189.6192 0 0 0-189.6192 189.6448v353.9456c0 13.9776 11.3152 25.2928 25.2928 25.2928h372.9408a170.6496 170.6496 0 0 0 170.6496-170.6496v-145.408a25.2928 25.2928 0 0 0-25.2928-25.2672z"
                fill="#C71D23" p-id="2810"></path>
            </svg>
          </a>
        </a-tooltip>


      </a-layout-footer> -->
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
import { ref } from 'vue'

const isFooterVisible = ref(false)

document.addEventListener('mousemove', (e) => {
  const threshold = window.innerHeight - 200 // 距离底部50px触发
  isFooterVisible.value = e.clientY >= threshold
})
</script>

<style scoped lang="scss">
#basicLayout .header {
  padding-inline: 20px;
  background: white;
  color: unset;
  margin-bottom: 1px;
}

#basicLayout .sider {
  background: #fff;
  border-right: 0.5px solid #eee;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  //background: linear-gradient(to right, #fefefe, #fff);
  background-color: #fff;
  //margin-bottom: 300px;
}

#basicLayout .footer {
  background-color: #f6f4f4;
  padding: 16px;
  position: fixed;
  bottom: -60px; // 初始位置在屏幕外
  left: 0;
  right: 0;
  text-align: center;
  transition: bottom 0.3s ease-in-out;
  color: #f6f4f4;

  svg {
    align-items: center;
  }

  &.show-footer {
    bottom: 0;
  }


}
</style>
