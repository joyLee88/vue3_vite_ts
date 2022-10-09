import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
//@ts-ignore
import viteCompression from "vite-plugin-compression";
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import pxtovw from "postcss-px-to-viewport";
const basePxToVw = pxtovw({
  viewportWidth: 750,
  viewportUnit: "vw"
})

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", //打包路径
  plugins: [
    vue(),
    // gzip压缩 生产环境生成 .gz 文件
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      ext: ".gz",
    }),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    // 公用样式
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/style/main.scss";',
      },
    },
    postcss: {
      plugins: [basePxToVw]
    }
  },
  //启动服务配置
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: true,
    https: false,
    proxy: {},
  },
  // 生产环境打包配置
  //去除 console debugger
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
