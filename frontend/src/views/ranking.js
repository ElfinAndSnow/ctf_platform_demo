import echarts from "../utils/echarts.js";
import '../assets/css/ranking.css'
import { getUserRanking, getTeamRanking } from "../api/api.js";
/*
排名内容
1. 总分前七队伍随时间变化的积分折线图
2. 所有队伍的总分、各题解题情况
 */
export default {
  target: 'main',
  data: {
    chartTaget: '.chart',
    chart: {},
    option: {},
  },
  methods: {
    // 获取用户
    showUserGrade: async (page) => {
      // 获取信息
      const results = await getUserRanking(page)
      // 获取失败
      if (results === null) {
        return
      }
      // 折线图
      // 获取用户名列表、积分数据
      const userList = []
      const series = []
      results.forEach(item => {
        // 用户名
        userList.push(item.username)
        // series 用于构成坐标点数据
        const data = []
        for (let obj of item.score_set){
          data.push([
            obj.solved_at,
            obj.current_points
          ])
        }
        series.push({
          name: item.username,
          type: 'line',
          data
        })
      })
      // 折线图配置信息
      const option = {
        // 标题
        title: {
          text: '用户积分折线图',
          x: 'center',
          y: 'top',
          textAlign: 'left',
          textStyle: {
            color: '#818CF8'
          },
        },
        // 图例组件
        legend: {
          show: true,
          top: '6%',
          data: userList,
          textStyle: {
            color: '#818CF8',
          },
        },
        // x轴 时间
        xAxis: {
          type: 'time',
          axisLabel: {
            // 展示格式
            formatter: function (dateString){
              const t_date = new Date(dateString);
              return t_date.getFullYear() + '\n' + (t_date.getMonth() + 1) + '-' + t_date.getDate()
            },
            textStyle: {
              color: '#818CF8',
            },
          },
        },
        // y轴 积分值
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#818CF8',
            },
          },
        },
        // series 数据（坐标）
        series,
        // tooltip 提示框
        tooltip: {
          trigger: 'item',
          formatter: function(params){
            return params.marker + params.seriesName + '<br>' + '积分：' + params.data[1] + '<br />时间：' + params.data[0]
          }
        }
      }
      // 渲染折线图
      const chart = echarts.init(document.querySelector('#user-rank>.chart'))
      chart.setOption(option)
      // 绑定resize事件，实现自适应
      window.addEventListener('resize', chart.resize)
    },
    getTeamGrade: async (page) => { 
      // 获取信息
      const results = await getTeamRanking(page)
      // 获取失败
      if (results === null) {
        return
      }
      // 获取用户名列表、积分数据
      const userList = []
      const series = []
      results.forEach(item => {
        // 用户名
        userList.push(item.username)
        // series 用于构成坐标点数据
        const data = []
        for (let obj of item.score_set){
          data.push([
            obj.solved_at,
            obj.current_points
          ])
        }
        series.push({
          name: item.username,
          type: 'line',
          data
        })
      })
      return {
        userList,
        series
      }
    },
    // initData: () => {
    //   const teams = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7'];
    //   const startDate = new Date('2023-10-01');
    //   const endDate = new Date(); // 当前日期
    //   const dateData = [];
    //   const scoreData = [];
  
    //   for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    //     dateData.push(date.toLocaleDateString());
    //     const scores = teams.map(() => Math.floor(Math.random() * 100)); // 随机生成分数
    //     scoreData.push(scores);
    //   }
    //   return {
    //     legend: {
    //       data: teams,
    //       textStyle: {
    //         color: '#818CF8',
    //       },
    //     },
    //     xAxis: {
    //       type: 'category',
    //       data: dateData,
    //       axisLabel: {
    //         textStyle: {
    //           color: '#818CF8',
    //         },
    //       },
    //     },
    //     yAxis: {
    //       type: 'value',
    //       axisLabel: {
    //         textStyle: {
    //           color: '#818CF8',
    //         },
    //       },
    //     },
    //     series: teams.map((team, index) => ({
    //       name: team,
    //       type: 'line',
    //       stack: '总分',
    //       data: scoreData.map(scores => scores[index]),
    //     }))
    //   }
    // },
    // initChart: (chartTaget, option) => {
    //   let chart = echarts.init(document.querySelector(chartTaget))
    //   chart.setOption(option)
    //   return chart
    // },
    // resizeChart: (chart) => {
    //   if (typeof chart?.resize !== 'undefined'){
    //     return chart.resize
    //   }
    // }
  },
  template: `
    <div id="rank">
      <div class="radio-inputs">
        <label class="radio">
          <input type="radio" name="radio" checked>
          <span class="name">个人排名</span>
        </label>
        <label class="radio">
          <input type="radio" name="radio">
          <span class="name">战队排名</span>
        </label>
      </div>
      <div class="card rank" id="user-rank">
        <div class="chart"></div>
        <div class="table"></div>
        <p class="pagenum">共1页，总共5个用户</p>
        <div class="pagination">
          <div class="page-switcher" id="prev">&lt;</div>
          <div class="page-switcher" id="page">1</div>
          <div class="page-switcher" id="next">&gt;</div>
        </div>
        <form class="pageinput" style="display: none">
            <input type="text" placeholder="页码" value="1">
            <button>确认</button>
        </form>
        </div>
      <div class="card rank" id="team-rank" style="display: none">
        <div class="chart"></div>
        <div class="table"></div>
        <p class="pagenum"></p>
        <div class="pagination">
          <div class="page-switcher" id="prev">&lt;</div>
          <div class="page-switcher" id="page">1</div>
          <div class="page-switcher" id="next">&gt;</div>
        </div>
        <form class="pageinput" style="display: none">
          <input type="text" placeholder="页码" value="1">
          <button>确认</button>
        </form>
        </div>
      </div>
    </div>
  `,
  beforeMount: function() {
    return this.template
  },
  afterMount: function() {
    // 获取用户排名信息
    this.methods.showUserGrade(1)
  },
  destroyed: function() {
  }
}