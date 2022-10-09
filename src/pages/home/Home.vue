<script setup lang="ts">
import { ref } from "vue";
import { useMainStore } from "@/store/main";

const mainStore = useMainStore();

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <h1>首页</h1>
  <div>{{ mainStore.name }}</div>
  <div
    id="xx"
    class="dd"
    class1="dd"
    class2="dd"
    class3="dd"
    class4="dd"
    class5="dd"
    class6="dd"
  >
    dddd
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
