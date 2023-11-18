import * as echarts from 'echarts'
import render from '../utils/render.js'
import {verify} from '../api/api.js'


export default async function router() {
    // 目前载入的主视图组件
    let view = undefined
    // 路由表
    const routes = {
        '/home': {
          render: () => {
          // 懒加载组件
            import('../views/home.js').then((module) => {
              view = render(module.default)
            })
          },
          noVerify: true
        },
        '/challenges': {
          render: () => {
            import('../views/challenges.js').then((module) => {
              view = render(module.default)
            })
          },
          noVerify: false,
        },
        '/ranking': {
          render: () => {
            import('../views/ranking.js').then((module) => {
              view = render(module.default)
            })
          },
          noVerify: false,
        },
        '/login': {
          render: () => {
            import('../views/login.js').then((module) => {
              view = render(module.default)
            })
          },
          noVerify: true,
        },
    };

    function handleHashChange() {
      const hash = window.location.hash.slice(1) === '/' ? '/home' : location.hash.slice(1);
      if (hash in routes){
        routerGuard(hash)
      }
      else {
        window.alert('访问了不存在的页面，将返回首页')
        window.location.hash = '#/home'
      }
    }

    // 路由守卫
    async function routerGuard(hash) {
      const route = routes[hash]
      if (route.noVerify){
        navTo(route)
      }
      else {
        const isLogined = await verify()
        if (isLogined){
          navTo(route)
        }
      }
    }
    // 路由跳转实现
    function navTo(route) {
      // 销毁上个页面的监听事件
      if (typeof view?.destroyed !== 'undefined'){
        view.destroyed()
      }
      // 载入路径对应的组件
      view = route.render()
    }
    
    // 注册路由
    window.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('hashchange', handleHashChange)
      window.history.pushState('','',location.hash === ''? '#/home':location.hash)
      handleHashChange()
    })
}