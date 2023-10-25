import * as echarts from 'echarts'
import render from '../utils/render.js'
import {verify} from '../api/api.js'


export default async function router() {
    let view = undefined
    const routes = {
        home: () => {
          import('../views/home.js').then((module) => {
            view = render(module.default)
          })
        },
        challenges: () => {
          import('../views/challenges.js').then((module) => {
            view = render(module.default)
          })
        },
        ranking: () => {
          import('../views/ranking.js').then((module) => {
            view = render(module.default)
          })
        },
        login: () => {
          import('../views/login.js').then((module) => {
            view = render(module.default)
          })
        },
    };
    

    function navTo() {
      const hash = window.location.hash.slice(1) || 'home';
      const route = routes[hash]
      if (route) {
        if (typeof view?.destroyed !== 'undefined'){
          view.destroyed()
        }
        view = route()
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('hashchange', navTo)
      navTo()
    })

}