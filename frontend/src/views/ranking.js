import echarts from "../utils/echarts.js";
import '../assets/css/ranking.css'
import { getUserRanking, getTeamRanking } from "../api/api.js";
import { disConnect } from "echarts";
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
          text: '用户积分排行前十',
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
          type: 'scroll',
          textStyle: {
            color: '#818CF8',
          },      
        },
        grid: {
          x: '8%',
          y: '25%',
          x2: '5%',
          y2: '10%',
          height: '65%',
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
      for(let i = 1; 4*i < 10 && 4*i < teamList.length; i++){
        teamList[4*i] += '\n'
      }
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
          type: 'scroll',
        },
        grid: {
          x: '8%',
          y: '25%',
          x2: '5%',
          y2: '10%',
          height: '65%'
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
    switchView: function() {
      const self = this
      return function(e) {
        // 过滤被点击的input
        if (e.target.tagName === 'LABEL'){
          // 渲染表格
          self.appendGradeList()
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
      }

    },
    appendGradeList: async function() {
      if (document.querySelector('#user-view>input').checked){
        const page = document.getElementById('user-page').innerText
        // 清空table
        const table = document.querySelector('#user-rank>.table')
        table.innerHTML = `
          <div class="hr"></div>
          <div class="grade">
            <div class="rate">排名</div>
            <div class="name">用户名</div>
            <div class="score">积分</div>
            <div class="time">最近解题时间</div>
          </div>
          <div class="hr"></div>
        `
        // 获取数据
        const response = await getUserRanking(page)
        const results = response?.results
        // 渲染数据
        results.forEach(item => {
          const info = item?.score_set.at(-1)
          const rate = String((page-1)*10+results.indexOf(item)+1).padStart(5, '0')
          const points = info?.current_points || 0
          const time = new Date(info?.solved_at)
          const date = typeof info?.solved_at !== 'undefined' ? time.getFullYear() + '-' + time.getMonth() + '-' + time.getDate() : 'No Date'
          const template = `
            <div class="grade">
              <div class="rate">${rate}</div>
              <div class="name">${item.username}</div>
              <div class="score">${points}</div>
              <div class="time">${date}</div>
            </div>
            <div class="hr"></div>
          `
          table.innerHTML += template
        })
      }
      else {
        const page = document.getElementById('team-page').innerText
        // 清空table
        const table = document.querySelector('#team-rank>.table')
        table.innerHTML =  `
          <div class="hr"></div>
          <div class="grade">
            <div class="rate">排名</div>
            <div class="name">战队名</div>
            <div class="score">积分</div>
            <div class="time">最近解题时间</div>
          </div>
          <div class="hr"></div>
        `
        // 获取数据
        const currentPage = parseInt(document.getElementById('user-page').innerText)
        const response = await getTeamRanking(page)
        const results = response?.results
        // 渲染数据
        results.forEach(item => {
          const info = item.teamscore_set.at(-1)
          const points = info?.current_points || 0
          const time = new Date(info?.solved_at)
          const date = typeof info?.solved_at !== 'undefined' ? time.getFullYear() + '-' + time.getMonth() + '-' + time.getDate() : 'No Date'
          const template = `
            <div class="grade">
              <div class="rate">${(page-1)*10+results.indexOf(item)+1}</div>
              <div class="name">${item.name}</div>
              <div class="score">${points}</div>
              <div class="time">${date}</div>
            </div>
            <div class="hr"></div>
          `
          table.innerHTML += template
        })
      }
    },
    // 显示页码输入框
    showPageInput: function(e) {
      const input = document.getElementById(e.target.dataset.input)
      input.style.display = 'flex'
      // 默认填入当前页码
      input.querySelector('input').value = e.target.innerText
    },
    hidePageInput: function(e) {
      const userInput = document.getElementById('user-input')
      const teamInput = document.getElementById('team-input')
      if (!userInput.contains(e.target)&&e.target!==document.getElementById('user-page')){
          userInput.style.display = 'none'
      }
      if (!teamInput.contains(e.target)&&e.target!==document.getElementById('team-page')){
        teamInput.style.display = 'none'
      }
    },
    toAllocated: function() {
      const self = this
      return async function(e) {
        const pageNum = parseInt(e.target.previousElementSibling.value)
        let totalPage = 0
        if (e.target.dataset.page === 'user-page'){
          totalPage = parseInt(document.getElementById('rank').dataset.usernum / 10) + 1
        }
        else if (e.target.dataset.page === 'team-page'){
          totalPage = parseInt(document.getElementById('rank').dataset.teamnum / 10) + 1
        }
        if (pageNum < 1 || pageNum > totalPage){
          window.alert('不存在该页面')
          return
        }
        document.getElementById(e.target.dataset.page).innerText = pageNum
        self.appendGradeList()
      }
    },
      // 上一页
    toPrev: function() {
      const self = this
      return async function(e) {
          const page = document.getElementById(e.target.dataset.page)
          const pageNum = parseInt(page.innerText) - 1
          let totalPage = 0
          if (e.target.dataset.page === 'user-page'){
            totalPage = parseInt(document.getElementById('rank').dataset.usernum / 10) + 1
          }
          else if (e.target.dataset.page === 'team-page'){
            totalPage = parseInt(document.getElementById('rank').dataset.teamnum / 10) + 1
          }
          if (pageNum < 1 || pageNum > totalPage){
            window.alert('不存在该页面')
            return
          }
          document.getElementById(e.target.dataset.page).innerText = pageNum
          self.appendGradeList()
      }
    },
    // 下一页
    toNext: function() {
      const self = this
      return async function(e) {
        const page = document.getElementById(e.target.dataset.page)
        const pageNum = parseInt(page.innerText) + 1
        let totalPage = 0
        if (e.target.dataset.page === 'user-page'){
          totalPage = parseInt(document.getElementById('rank').dataset.usernum / 10) + 1
        }
        else if (e.target.dataset.page === 'team-page'){
          totalPage = parseInt(document.getElementById('rank').dataset.teamnum / 10) + 1
        }
        if (pageNum < 1 || pageNum > totalPage){
          window.alert('不存在该页面')
          return
        }
        document.getElementById(e.target.dataset.page).innerText = pageNum
        self.appendGradeList()
      }
    },
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
        <p class="pagenum"></p>
        <div class="pagination">
          <div class="page-switcher" id="user-prev" data-page="user-page">&lt;</div>
          <div class="page-switcher" id="user-page" data-input="user-input">1</div>
          <div class="page-switcher" id="user-next" data-page="user-page">&gt;</div>
        </div>
        <form class="pageinput card" style="display: none" id="user-input">
            <input type="text" placeholder="页码" value="1">
            <button data-page="user-page">确认</button>
        </form>
      </div>
      <div class="rank hide" id="team-rank">
        <div class="chart"></div>
        <div class="table"></div>
        <p class="pagenum"></p>
        <div class="pagination">
          <div class="page-switcher" id="team-prev" data-page="team-page">&lt;</div>
          <div class="page-switcher" id="team-page" data-input="team-input">1</div>
          <div class="page-switcher" id="team-next" data-page="team-page">&gt;</div>
        </div>
        <form class="pageinput card" style="display: none" id="team-input">
          <input type="text" placeholder="页码" value="1">
          <button data-page="team-page">确认</button>
        </form>
      </div>
    </div>
  `,
  afterMount: function() {
    this.methods.switchTableView = this.methods.switchView()
    this.methods.turnToPrev = this.methods.toPrev()
    this.methods.turnToNext = this.methods.toNext()
    this.methods.turnToAllocated = this.methods.toAllocated()
    // 获取前十用户&战队排名折线图
    this.methods.showUserLineChart(1)
    this.methods.showTeamLineChart(1)
    this.methods.appendGradeList()
    document.getElementById('radio-inputs').addEventListener('click', this.methods.switchTableView)
    document.getElementById('radio-inputs').addEventListener('click', this.methods.appendGradeList)
    document.getElementById('user-page').addEventListener('click', this.methods.showPageInput)
    document.getElementById('team-page').addEventListener('click', this.methods.showPageInput)
    document.addEventListener('click', this.methods.hidePageInput)
    document.querySelectorAll('form>button').forEach(item => {
      item.addEventListener('click', this.methods.turnToAllocated)
    })
    document.getElementById('team-prev').addEventListener('click', this.methods.turnToPrev)
    document.getElementById('user-prev').addEventListener('click', this.methods.turnToPrev)
    document.getElementById('team-next').addEventListener('click', this.methods.turnToNext)
    document.getElementById('user-next').addEventListener('click', this.methods.turnToNext)
    
  },
  destroyed: function() {
    document.getElementById('radio-inputs').removeEventListener('click', this.methods.switchTableView)
    document.getElementById('radio-inputs').removeEventListener('click', this.methods.appendGradeList)
    document.getElementById('user-page').removeEventListener('click', this.methods.showPageInput)
    document.getElementById('team-page').removeEventListener('click', this.methods.showPageInput)
    document.removeEventListener('click', this.methods.hidePageInput)
    document.querySelectorAll('form>button').forEach(item => {
      item.removeEventListener('click', this.methods.turnToAllocated)
    })
    document.getElementById('team-prev').removeEventListener('click', this.methods.turnToPrev)
    document.getElementById('user-prev').removeEventListener('click', this.methods.turnToPrev)
    document.getElementById('team-next').removeEventListener('click', this.methods.turnToNext)
    document.getElementById('user-next').removeEventListener('click', this.methods.turnToNext)
    this.methods.destroyLineChart()
  }
}