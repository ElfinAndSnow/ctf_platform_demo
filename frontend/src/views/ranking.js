import echarts from "../utils/echarts.js";
import '../assets/css/ranking.css'
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
    initData: () => {
      const teams = ['Team1', 'Team2', 'Team3', 'Team4', 'Team5', 'Team6', 'Team7'];
      const startDate = new Date('2023-10-01');
      const endDate = new Date(); // 当前日期
      const dateData = [];
      const scoreData = [];
  
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dateData.push(date.toLocaleDateString());
        const scores = teams.map(() => Math.floor(Math.random() * 100)); // 随机生成分数
        scoreData.push(scores);
      }
      return {
        legend: {
          data: teams,
          textStyle: {
            color: '#818CF8',
          },
        },
        xAxis: {
          type: 'category',
          data: dateData,
          axisLabel: {
            textStyle: {
              color: '#818CF8',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              color: '#818CF8',
            },
          },
        },
        series: teams.map((team, index) => ({
          name: team,
          type: 'line',
          stack: '总分',
          data: scoreData.map(scores => scores[index]),
        }))
      }
    },
    initChart: (chartTaget, option) => {
      let chart = echarts.init(document.querySelector(chartTaget))
      chart.setOption(option)
      return chart
    },
    resizeChart: (chart) => {
      if (typeof chart?.resize !== 'undefined'){
        return chart.resize
      }
    }
  },
  template: `
    <div id="rank">
      <div class="radio-inputs">
        <label class="radio">
          <input type="radio" name="radio" checked="">
          <span class="name">个人排名</span>
        </label>
        <label class="radio">
          <input type="radio" name="radio">
          <span class="name">战队排名</span>
        </label>
      </div>
      <div class="card chart"></div>
      <div class="card table" style="display:></div>
    </div>
  `,
  beforeMount: function() {
    this.data.option = this.methods.initData()
    return this.template
  },
  afterMount: function() {
    this.data.chart = this.methods.initChart(this.data.chartTaget, this.data.option)
    window.addEventListener('resize', this.methods.resizeChart(this.data.chart))
    this.methods.resizeChart()
  },
  destroyed: function() {
    window.removeEventListener('resize', this.methods.resizeChart(this.data.chart))
    this.data.chart.dispose()
  }
}