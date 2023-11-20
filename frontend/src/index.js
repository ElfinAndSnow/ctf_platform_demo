// 预加载
import(/* webpackPreload: true */ './utils/preload.js')
.then(({preload}) => {
    preload()
})

import './assets/css/main.css'

import render from './utils/render.js'

//载入logo


//导航栏
import header from './components/header.js'
render(header)

//页脚
import footer from './components/footer.js'
render(footer)

//注册路由
import router from './router/routers'
router()

