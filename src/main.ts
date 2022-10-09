import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import { createPinia } from "pinia";
import vant from "./utils/vantui";

createApp(App).use(router).use(createPinia()).use(vant).mount("#app");
