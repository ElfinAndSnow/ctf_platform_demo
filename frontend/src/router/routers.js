import initHome from '../views/home.js'

import '../assets/css/challenge.css'
import initChallenges from '../views/challenges.js'

import '../assets/css/ranking.css'
import initRanking from '../views/ranking.js'

import * as echarts from 'echarts'


export default async function router() {

    const routes = {
        home: {
          render: initHome
        },
        challenges: {
          render: initChallenges
        },
        ranking: {
          render: initRanking
        }
    };

    let destroyPrev = false

    function navTo() {
      const hash = window.location.hash.slice(1) || 'home';
      const route = routes[hash]
      if (route) {
        if (destroyPrev){
          destroyPrev()
        }
        destroyPrev = route.render()
      }
    }


    //initiate page
    navTo()

    window.addEventListener('hashchange', navTo)

}