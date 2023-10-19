import(/* webpackPreload: true */ './utils/preload.js')
.then(({preload}) => {
    preload()
})

import './assets/css/main.css'

//载入logo
import logo from'./assets/images/logo.png'

//导航栏
import initHeader from './components/header.js'
initHeader()
document.querySelectorAll('.logo').forEach(i => i.src=logo)

//内容页
import initMain from './components/main.js'
initMain()

//页脚
import initFooter from './components/footer.js'
initFooter()

//路由
import router from './router/routers'
router()