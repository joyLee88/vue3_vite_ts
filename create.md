# 2022-10-08

1. 升级本机 vue3 开发环境

- vscode 安装，配置开发插件
- 升级 node 版本 >= 12.0.0
- yarn 工具安装及环境配置

2. 创建 vue3+vite+ts 移动端项目
   yarn create @vitejs/app incallVue3 --template
   cd incallVue3
   yarn 下载依赖
   yarn dev 启动

3. 项目文件结构
   按照视图层、组件层、工具类、资源类等方式组织文件结构

4. 配置文件引用别名
   修改 vite.config.ts:

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

若报错：找不到模块“path”或其相应的类型声明
安装：
yarn add @types/node --save-dev

因为 path 模块是 node.js 内置的功能，但是 node.js 本身并不支持 ts！！！
会报错：模块 ""path"" 只能在使用 "allowSyntheticDefaultImports" 标志时进行默认导入

方法 1:改 vue3 写法

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

方法 2: 改 tsconfig.node.json
compilerOptions 对象属性添加"allowSyntheticDefaultImports": true 即可

5. 修改 tsconfig.json
   compilerOptions 添加 baseUrl 和 paths

```js

{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom"],
    "baseUrl": ".",
    "paths": {
      "@/*":["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

6. 环境变量配置
   vite 提供了两种模式：具有开发服务器的开发模式（development）和生产模式（production）

- 项目根目录新建:.env.development :
  NODE_ENV=development

VITE_APP_WEB_URL= 'YOUR WEB URL'

- 项目根目录新建:.env.production :
  NODE_ENV=production

VITE_APP_WEB_URL= 'YOUR WEB URL'

- 使用
  console.log(import.meta.env.VITE_APP_WEB_URL)

- 配置 package.json
  打包区分开发环境和生产环境，在 scripts 添加
  "build:dev": "vue-tsc --noEmit && vite build --mode development",
  "build:pro": "vue-tsc --noEmit && vite build --mode production",

7. vite 常用基础配置
   vite.config

(1) server 代理配置
(2) build 打包去掉 console debug
(3) 生产环境生成.gz 文件
开启 gzip 可以极大的压缩静态资源，对页面加载的速度起到了显著的作用。
使用 vite-plugin-compression 可以 gzip 或 brotli 的方式来压缩资源，这一步需要服务器端的配合，vite 只能帮你打包出 .gz 文件。此插件使用简单，你甚至无需配置参数，引入即可。

- 安装

yarn add --dev vite-plugin-compression

- plugins 中添加

import viteCompression from 'vite-plugin-compression'

// gzip 压缩 生产环境生成 .gz 文件
viteCompression({
verbose: true,
disable: false,
threshold: 10240,
algorithm: 'gzip',
ext: '.gz',
}),

so, finally

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
//@ts-ignore
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', //打包路径
  plugins: [
    vue(),
    // gzip压缩 生产环境生成 .gz 文件
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  // 配置别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/style/main.scss";',
      },
    },
  },
  //启动服务配置
  server: {
    host: '0.0.0.0',
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
```

# 2022-10-09

1. 配置项目所有工具库

- axios http

* 安装 axios

yarn add axios

- 安装 nprogress 用于请求 loading
  也可以根据项目需求自定义其它 loading

yarn add nprogress

- 类型声明，或者添加一个包含 `declare module 'nprogress'

yarn add @types/nprogress --dev

实际使用中可以根据项目修改，比如 RESTful api 中可以自行添加 put 和 delete 请求,ResType 也可以根据后端的通用返回值动态的去修改

- 新建 service 文件夹
  service 下新增 http.ts 文件以及 api 文件夹:

(1) http.ts : 用于 axios 封装

```js
//http.ts
import axios, { AxiosRequestConfig } from 'axios'
import NProgress from 'nprogress'

// 设置请求头和请求路径
axios.defaults.baseURL = '/api'
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.interceptors.request.use(
  (config): AxiosRequestConfig<any> => {
    const token = window.sessionStorage.getItem('token')
    if (token) {
      //@ts-ignore
      config.headers.token = token
    }
    return config
  },
  (error) => {
    return error
  }
)
// 响应拦截
axios.interceptors.response.use((res) => {
  if (res.data.code === 111) {
    sessionStorage.setItem('token', '')
    // token过期操作
  }
  return res
})

interface ResType<T> {
  code: number
  data?: T
  msg: string
  err?: string
}
interface Http {
  get<T>(url: string, params?: unknown): Promise<ResType<T>>
  post<T>(url: string, params?: unknown): Promise<ResType<T>>
  upload<T>(url: string, params: unknown): Promise<ResType<T>>
  download(url: string): void
}

const http: Http = {
  get(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .get(url, { params })
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  post(url, params) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .post(url, JSON.stringify(params))
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  upload(url, file) {
    return new Promise((resolve, reject) => {
      NProgress.start()
      axios
        .post(url, file, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => {
          NProgress.done()
          resolve(res.data)
        })
        .catch((err) => {
          NProgress.done()
          reject(err.data)
        })
    })
  },
  download(url) {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    iframe.onload = function () {
      document.body.removeChild(iframe)
    }
    document.body.appendChild(iframe)
  },
}
export default http
```

(2) api 文件夹：项目中接口做统一管理，按照模块来划分
在 api 文件下新增 login 文件夹,用于存放登录模块的请求接口,login 文件夹下分别新增 login.ts types.ts

login.ts

```js
import http from '@/service/http';
import * as T from './types';

const loginApi: T.ILoginApi = {
  login(params) {
    return http.post('/login', params);
  },
};
export default loginApi;
```

types.ts

```js
export interface ILoginParams {
    userName: string
    passWord: string | number
}
export interface ILoginApi {
    login: (params: ILoginParams)=> Promise<any>
}
```

- router 路由
  （1）安装
  yarn add vue-router@4

（2）在 src 文件下新增 router 文件夹 => router.ts 文件

```js
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/pages/login/Login.vue'), // 注意这里要带上 文件后缀.vue
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

（3）修改入口文件 mian.ts

```js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';

const app = createApp(App);

app.use(router);

app.mount('#app');
```

（4） router 路由配置
vue-router4.x 支持 typescript，配置路由的类型是 RouteRecordRaw：

title: string; 页面标题，通常必选。
icon?: string; 图标，一般配合菜单使用。
auth?: boolean; 是否需要登录权限。
ignoreAuth?: boolean; 是否忽略权限。
roles?: RoleEnum[]; 可以访问的角色
keepAlive?: boolean; 是否开启页面缓存
hideMenu?: boolean; 有些路由我们并不想在菜单中显示，比如某些编辑页面。
order?: number; 菜单排序。
frameUrl?: string; 嵌套外链。

- 状态管理 pina

由于 vuex 4 对 typescript 的支持让人感到难过，所以状态管理弃用了 vuex 而采取了 pinia. pinia 的作者是 Vue 核心团队成员

(1) 安装 pinia
安装

yarn add pinia@next

Pinia 与 Vuex 的区别：

id 是必要的，它将所使用 store 连接到 devtools。
创建方式：new Vuex.Store(...)(vuex3)，createStore(...)(vuex4)。
对比于 vuex3 ，state 现在是一个函数返回对象。
没有 mutations，不用担心，state 的变化依然记录在 devtools 中。

(2) main.ts 中增加

- 引入

import { createPinia } from "pinia"

- 创建根存储库并将其传递给应用程序

app.use(createPinia())

(3) src 下新建 store 文件夹
新建 main.ts

```js
import { defineStore } from 'pinia';

export const useMainStore = defineStore({
  id: 'mian',
  state: () => ({
    name: '超级管理员',
  }),
});
```

(4) 组件中获取 store

```js
<template>
  <div>{{mainStore.name}}</div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/store/main"

const mainStore = useMainStore()

</script>
```

(5) getters action

- getters
  Pinia 中的 getter 与 Vuex 中的 getter 、组件中的计算属性具有相同的功能

store/main.ts

```js
import { defineStore } from 'pinia';

export const useMainStore = defineStore({
  id: 'mian',
  state: () => ({
    name: '超级管理员',
  }),
  // getters
  getters: {
    nameLength: (state) => state.name.length,
  },
});
```

使用

```js
<template>
  <div>用户名:{{ mainStore.name }}<br />长度:{{ mainStore.nameLength }}</div>
  <hr/>
  <button @click="updateName">修改store中的name</button>
</template>

<script setup lang="ts">
import { useMainStore } from '@/store/main'

const mainStore = useMainStore()

const updateName = ()=>{
  // $patch 修改 store 中的数据
  mainStore.$patch({
    name: '名称被修改了,nameLength也随之改变了'
  })
}
</script>
```

- actions
  这里与 Vuex 有极大的不同，Pinia 仅提供了一种方法来定义如何更改状态的规则，放弃 mutations 只依靠 Actions，这是一项重大的改变。

让 Actions 更加的灵活：

- 可以通过组件或其他 action 调用
- 可以从其他 store 的 action 中调用
- 直接在 store 实例上调用
- 支持同步或异步
- 有任意数量的参数
- 可以包含有关如何更改状态的逻辑（也就是 vuex 的 mutations 的作用）
- 可以 $patch 方法直接更改状态属性

```js
import { defineStore } from 'pinia';

export const useMainStore = defineStore({
  id: 'mian',
  state: () => ({
    name: '超级管理员',
  }),
  getters: {
    nameLength: (state) => state.name.length,
  },
  actions: {
    async insertPost(data: string) {
      // 可以做异步
      // await doAjaxRequest(data);
      this.name = data;
    },
  },
});
```

2. 代码规范化配置

- eslint 支持
  (1) 安装

```js
# eslint
yarn add eslint --dev

# eslint 插件安装
yarn add eslint-plugin-vue --dev
yarn add @typescript-eslint/eslint-plugin --dev
yarn add eslint-plugin-prettier --dev

# typescript parser
yarn add @typescript-eslint/parser --dev
```

如果 eslint 安装报错
yarn config set ignore-engines true
运行成功后再次执行 eslint 安装命令

（2）项目根文件新建.eslintrc.js，配置 eslint 校验规则

```js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    // eslint-config-prettier 的缩写
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  // eslint-plugin-vue @typescript-eslint/eslint-plugin eslint-plugin-prettier的缩写
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-var': 'error',
    'prettier/prettier': 'error',
    // 禁止出现console
    'no-console': 'warn',
    // 禁用debugger
    'no-debugger': 'warn',
    // 禁止出现重复的 case 标签
    'no-duplicate-case': 'warn',
    // 禁止出现空语句块
    'no-empty': 'warn',
    // 禁止不必要的括号
    'no-extra-parens': 'off',
    // 禁止对 function 声明重新赋值
    'no-func-assign': 'warn',
    // 禁止在 return、throw、continue 和 break 语句之后出现不可达代码
    'no-unreachable': 'warn',
    // 强制所有控制语句使用一致的括号风格
    curly: 'warn',
    // 要求 switch 语句中有 default 分支
    'default-case': 'warn',
    // 强制尽可能地使用点号
    'dot-notation': 'warn',
    // 要求使用 === 和 !==
    eqeqeq: 'warn',
    // 禁止 if 语句中 return 语句之后有 else 块
    'no-else-return': 'warn',
    // 禁止出现空函数
    'no-empty-function': 'warn',
    // 禁用不必要的嵌套块
    'no-lone-blocks': 'warn',
    // 禁止使用多个空格
    'no-multi-spaces': 'warn',
    // 禁止多次声明同一变量
    'no-redeclare': 'warn',
    // 禁止在 return 语句中使用赋值语句
    'no-return-assign': 'warn',
    // 禁用不必要的 return await
    'no-return-await': 'warn',
    // 禁止自我赋值
    'no-self-assign': 'warn',
    // 禁止自身比较
    'no-self-compare': 'warn',
    // 禁止不必要的 catch 子句
    'no-useless-catch': 'warn',
    // 禁止多余的 return 语句
    'no-useless-return': 'warn',
    // 禁止变量声明与外层作用域的变量同名
    'no-shadow': 'off',
    // 允许delete变量
    'no-delete-var': 'off',
    // 强制数组方括号中使用一致的空格
    'array-bracket-spacing': 'warn',
    // 强制在代码块中使用一致的大括号风格
    'brace-style': 'warn',
    // 强制使用骆驼拼写法命名约定
    camelcase: 'warn',
    // 强制使用一致的缩进
    indent: 'off',
    // 强制在 JSX 属性中一致地使用双引号或单引号
    // 'jsx-quotes': 'warn',
    // 强制可嵌套的块的最大深度4
    'max-depth': 'warn',
    // 强制最大行数 300
    // "max-lines": ["warn", { "max": 1200 }],
    // 强制函数最大代码行数 50
    // 'max-lines-per-function': ['warn', { max: 70 }],
    // 强制函数块最多允许的的语句数量20
    'max-statements': ['warn', 100],
    // 强制回调函数最大嵌套深度
    'max-nested-callbacks': ['warn', 3],
    // 强制函数定义中最多允许的参数数量
    'max-params': ['warn', 3],
    // 强制每一行中所允许的最大语句数量
    'max-statements-per-line': ['warn', { max: 1 }],
    // 要求方法链中每个调用都有一个换行符
    'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 3 }],
    // 禁止 if 作为唯一的语句出现在 else 语句中
    'no-lonely-if': 'warn',
    // 禁止空格和 tab 的混合缩进
    'no-mixed-spaces-and-tabs': 'warn',
    // 禁止出现多行空行
    'no-multiple-empty-lines': 'warn',
    // 禁止出现;
    semi: ['warn', 'never'],
    // 强制在块之前使用一致的空格
    'space-before-blocks': 'warn',
    // 强制在 function的左括号之前使用一致的空格
    // 'space-before-function-paren': ['warn', 'never'],
    // 强制在圆括号内使用一致的空格
    'space-in-parens': 'warn',
    // 要求操作符周围有空格
    'space-infix-ops': 'warn',
    // 强制在一元操作符前后使用一致的空格
    'space-unary-ops': 'warn',
    // 强制在注释中 // 或 /* 使用一致的空格
    // "spaced-comment": "warn",
    // 强制在 switch 的冒号左右有空格
    'switch-colon-spacing': 'warn',
    // 强制箭头函数的箭头前后使用一致的空格
    'arrow-spacing': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-rest-params': 'warn',
    'no-useless-escape': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-prototype-builtins': 'warn',
    'no-fallthrough': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-case-declarations': 'warn',
    'no-async-promise-executor': 'warn',
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
```

（3）新建.eslintignore，忽略以下文件

```js
  # eslint 忽略检查 (根据项目需要自行添加)
  node_modules
  dist
```

（4）代码换行
当超出折行长度时，才对属性进行换行
volar/ beautify 插件

- prettier 支持
  （1）安装
  yarn add prettier --dev

（2）解决 eslint 和 prettier 冲突
解决 ESLint 中的样式规范和 prettier 中样式规范的冲突，以 prettier 的样式规范为准，使 ESLint 中的样式规范自动失效

- 安装插件 eslint-config-prettier
  yarn add eslint-config-prettier --dev

（3）新建.prettier.js,配置 prettier 格式化规则

```js
module.exports = {
  tabWidth: 2,
  jsxSingleQuote: true,
  jsxBracketSameLine: true,
  printWidth: 100,
  singleQuote: true,
  semi: false,
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
  ],
  arrowParens: 'always',
};
```

（4）新建.prettierignore，忽略以下文件

```js
  # 忽略格式化文件 (根据项目需要自行添加)
  node_modules
  dist
```

（5）package 配置，scirpt 添加
{
"script": {
......

        "lint": "eslint src --fix --ext .ts,.tsx,.vue,.js,.jsx",
        "prettier": "prettier --write ."

    }
    }

以下命令测试下代码检查个格式化效果:

- eslint 检查

yarn lint

- prettier 自动格式化

yarn prettier

3. 实现 git 仓库提交管理
   配置 husky + lint-staged
   使用 husky + lint-staged 助力团队编码规范, husky&lint-staged 安装推荐使用 mrm, 它将根据 package.json 依赖项中的代码质量工具来安装和配置 husky 和 lint-staged，因此请确保在此之前安装并配置所有代码质量工具，如 Prettier 和 ESlint

（1）安装 mrm
npm i mrm -D --registry=https://registry.npm.taobao.org

husky 是一个为 git 客户端增加 hook 的工具。安装后，它会自动在仓库中的 .git/ 目录下增加相应的钩子；比如 pre-commit 钩子就会在你执行 git commit 的触发。

那么我们可以在 pre-commit 中实现一些比如 lint 检查、单元测试、代码美化等操作。当然，pre-commit 阶段执行的命令当然要保证其速度不要太慢，每次 commit 都等很久也不是什么好的体验。

lint-staged，一个仅仅过滤出 Git 代码暂存区文件(被 git add 的文件)的工具；这个很实用，因为我们如果对整个项目的代码做一个检查，可能耗时很长，如果是老项目，要对之前的代码做一个代码规范检查并修改的话，这可能就麻烦了呀，可能导致项目改动很大。

所以这个 lint-staged，对团队项目和开源项目来说，是一个很好的工具，它是对个人要提交的代码的一个规范和约束

（2）安装 lint-staged
mrm 安装 lint-staged 会自动把 husky 一起安装下来

npx mrm lint-staged

安装成功的话，package.json，多了:
scripts 中的 prepare
devDependencies 中的 husky lint-staged mrm
lint-staged

要结合 prettier 代码格式化,所以修改一下配置:
"husky": {
"hooks": {
"pre-commit": "lint-staged"
}
},
"lint-staged": {
"\*.{js,jsx,vue,ts,tsx}": [
"yarn lint",
"prettier --write",
"git add"
]
}

- 到这里代码格式化配置基本大功告成

当执行 commit 的时候，控制台可以看到走的流程里有 yarn lint，会对要提交的代码进行格式化处理

# 2022-10-10

1. 实现简单页面结构；
2. css 预处理器；
   虽然 vite 原生支持 less/sass/scss/stylus，但是你必须手动安装他们的预处理器依赖

- 安装
  yarn add sass-loader --dev
  yarn add dart-sass --dev
  yarn add sass --dev

- 配置全局 scss 样式文件
  在 src/assets 下新增 style 文件夹，用于存放全局样式文件

- 新建 main.scss, 设置一个用于测试的颜色变量 :
  $test-color: red;

- 如何将这个全局样式文件全局注入到项目中呢？配置 Vite.config 即可：
  // resolve 下面添加
  css:{
  preprocessorOptions:{
  scss:{
  additionalData:'@import "@/assets/style/main.scss";'
  }
  }
  },

从而，可以直接在组件中使用,不需要任何引入可以直接使用全局 scss 定义的变量

<style scoped lang="scss">
a {
  color: $test-color;
}
</style>

3. ui 库

- yarn add vant
- src/utils/vantui.ts

```js
import { App } from 'vue';
import { Button } from 'vant';
const Vant = {
  install: (app: App): void => {
    app.use(Button);
  },
};
export default Vant;
```

- 在 main.ts 引入
  import vant from "./utils/vantui";
  再 use

- 安装按需引入的插件
  yarn add vite-plugin-style-import -D

- vue.config.js 增加

```js
import styleImport, { VantResolve } from "vite-plugin-style-import";

plugins的数组中加
  styleImport({
      resolves: [VantResolve]
    })

若是2.0版本
import { createStyleImportPlugin, VantResolve } from "vite-plugin-style-import";

createStyleImportPlugin({
      resolves: [VantResolve()]
    })
```

报错：
Cannot find module 'consola'

yarn add consola -D

- 在 nodemodule 里 vant 的路径不对
  node_modules/vant/lib/vant/es/button/style
  实际是没有 lib/vant 的

```js
createStyleImportPlugin({
  resolves: [VantResolve()],
  libs: [
    {
      libraryName: 'vant',
      esModule: true,
      resolveStyle: (name) => `../es/${name}/style`,
    },
  ],
});
```

- 按需引入(vant 官网)
  yarn add unplugin-vue-components -D

vite.config.ts

```js
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';

plugin的数组中加
Components({
      resolvers: [VantResolver()],
    }),
```

使用：
<van-button type="primary">登录</van-button>

4. 移动端适配
   yarn add postcss-px-to-viewport
   vite 集成了 postcss，不用添加 postcss 配置文件
   vite.config：

```js
import pxtovw from "postcss-px-to-viewport";
const basePxToVw = pxtovw({
  viewportWidth: 750,
  viewportUnit: "vw"
})
在css
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
```

5. 移动端 click 响应延迟

- 禁用缩放

<meta name = "viewport" content="user-scalable=no" >

缺点: 网页无法缩放

- 更改默认视口宽度

<meta name="viewport" content="width=device-width">

- fastclick
  原理: 在检测到 touchend 事件的时候，会通过 DOM 自定义事件立即出发模拟一个 click 事件，并把浏览器在 300ms 之后真正的 click 事件阻止掉
  yarn add fastclick -S

env.d.ts 进行文件类型声明

```js
declare module "fastclick" {
  import type FastClickStatic from "@/utils/types/fastClickType";
  const FastClick: FastClickStatic;
  export = FastClick;
}
```

main.ts

```js
import FastClick from 'fastclick';
FastClick.attach(document.body);
```

6. 实现项目主题切换方案

7. mock

8. vconsole

# 常用插件

可以查看官方文档：https://vitejs.cn/plugins/

- @vitejs/plugin-vue 提供 Vue 3 单文件组件支持
- @vitejs/plugin-vue-jsx 提供 Vue 3 JSX 支持（通过 专用的 Babel 转换插件）
- @vitejs/plugin-legacy 为打包后的文件提供传统浏览器兼容性支持
- unplugin-vue-components 组件的按需自动导入
- vite-plugin-compression 使用 gzip 或者 brotli 来压缩资源

非常推荐使用的 hooks 库
VueUse：https://vueuse.org/
和 react hooks 真的很像，所以就称为 hooks
VueUse 是一个基于 Composition API 的实用函数集合。通俗的来说，这就是一个工具函数包，它可以帮助你快速实现一些常见的功能，免得你自己去写，解决重复的工作内容。以及进行了基于 Composition API 的封装。
