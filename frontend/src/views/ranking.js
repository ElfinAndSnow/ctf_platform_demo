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
  methods: {
    // 获取用户
    showUserLineChart: async function(page) {
      // 获取信息
      const response = await getUserRanking(page)
      const results = response.results
      // 记录用户数
      document.getElementById('rank').setAttribute('data-usernum', response.count)
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
          top: '10%',
          data: userList,
          textStyle: {
            color: '#818CF8',
          },
        },
        grid: {
          x: '7%',
          y: '20%',
          x2: '5%',
          y2: '10%',
        },
        // x轴 时间
        xAxis: {
          type: 'time',
          axisLabel: {
            // 展示格式
            formatter: function (dateString){
              const t_date = new Date(dateString);
              return (t_date.getMonth() + 1) + '-' + t_date.getDate()
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
      this.userChart = chart
    },
    showTeamLineChart: async function(page) { 
      // 获取信息
      const response = await getTeamRanking(page)
      const results = response.results
      // 记录战队数
      document.getElementById('rank').setAttribute('data-teamnum', response.count)
      // 获取失败
      if (results === null) {
        return
      }
      // 折线图
      // 获取战队名列表、积分数据
      const teamList = []
      const series = []
      results.forEach(item => {
        // 用户名
        teamList.push(item.name)
        // series 用于构成坐标点数据
        const data = []
        for (let obj of item.teamscore_set){
          data.push([
            obj.solved_at,
            obj.current_points
          ])
        }
        series.push({
          name: item.name,
          type: 'line',
          data
        })
      })
      // 折线图配置信息
      const option = {
        // 标题
        title: {
          text: '战队积分折线图',
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
          top: '10%',
          data: teamList,
          textStyle: {
            color: '#818CF8',
          },
        },
        grid: {
          x: '7%',
          y: '20%',
          x2: '5%',
          y2: '10%',
        },
        // x轴 时间
        xAxis: {
          type: 'time',
          axisLabel: {
            // 展示格式
            formatter: function (dateString){
              const t_date = new Date(dateString);
              return (t_date.getMonth() + 1) + '-' + t_date.getDate()
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
      const chart = echarts.init(document.querySelector('#team-rank>.chart'))
      chart.setOption(option)
      // 绑定resize事件，实现自适应
      window.addEventListener('resize', chart.resize)
      this.teamChart = chart
    },
    destroyLineChart: function() {
      this.userChart.dispose()
      this.teamChart.dispose()
    },
    switchView: function(e) {
      // 过滤被点击的input
      if (e.target.tagName === 'LABEL'){
        if (e.target.id === 'user-view'){
          //隐藏team-rank
          document.getElementById('team-rank').classList.add('hide')
          // 显示user-rank
          document.getElementById('user-rank').classList.remove('hide')
        }
        else {
          //隐藏user-rank
          document.getElementById('user-rank').classList.add('hide')
          // 显示team-rank
          document.getElementById('team-rank').classList.remove('hide')
          
        }
      }
    },
    appendGradeList: function() {
      
    }
  },
  template: `
    <div id="rank">
      <div id="radio-inputs">
        <label class="radio" id="user-view">
          <input type="radio" name="radio" checked>
          <span class="name">个人排名</span>
        </label>
        <label class="radio" id="team-view">
          <input type="radio" name="radio">
          <span class="name">战队排名</span>
        </label>
      </div>
      <div class="rank" id="user-rank">
        <div class="chart"></div>
        <div class="table"></div>
        <p class="pagenum">共1页，总共5个用户</p>
        <div class="pagination">
          <div class="page-switcher" id="user-prev">&lt;</div>
          <div class="page-switcher" id="user-page">1</div>
          <div class="page-switcher" id="user-next">&gt;</div>
        </div>
        <form class="pageinput" style="display: none">
            <input type="text" placeholder="页码" value="1">
            <button>确认</button>
        </form>
      </div>
      <div class="card rank hide" id="team-rank">
        <div class="chart"></div>
        <div class="table"></div>
        <p class="pagenum"></p>
        <div class="pagination">
          <div class="page-switcher" id="team-prev">&lt;</div>
          <div class="page-switcher" id="team-page">1</div>
          <div class="page-switcher" id="team-next">&gt;</div>
        </div>
        <form class="pageinput" style="display: none">
          <input type="text" placeholder="页码" value="1">
          <button>确认</button>
        </form>
        </div>
      </div>
    </div>
  `,
  afterMount: function() {
    // 获取前十用户&战队排名折线图
    this.methods.showUserLineChart(1)
    this.methods.showTeamLineChart(1)
    document.getElementById('radio-inputs').addEventListener('click', this.methods.switchView)
  },
  destroyed: function() {
    document.getElementById('radio-inputs').removeEventListener('click', this.methods.switchView)
    this.methods.destroyLineChart()
  }
}