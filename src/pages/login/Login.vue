<script setup lang="ts">
import { ref } from "vue";
import { useMainStore } from "@/store/main";

const mainStore = useMainStore();

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <h1>登录</h1>
  <div class="tip">{{ mainStore.name }}</div>
  <van-button type="primary">登录</van-button>
</template>

<style scoped lang="scss">
.tip {
  color: $test-color;
  font-size: 18px;
}
</style>
