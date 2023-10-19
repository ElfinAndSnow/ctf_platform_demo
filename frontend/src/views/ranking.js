import echarts from "../utils/echarts.js";

export default function ranking() {
    const main = document.querySelector('main')
    main.innerHTML = `
        <div id="rank">
            <div id="chart"></div>
            <div id="ranking-table"></div>
        </div>
    `

    const rankChart = document.getElementById('chart', document.body.dataset.theme === 'dark'? 'dark':'light')
    let myChart = echarts.init(rankChart);

    // 指定图表的配置项和数据
    // 模拟数据
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


    // 使用 ECharts 创建图表

    const option = {
      // title: {
      //   text: '积分总榜',
      // },
      legend: {
        data: teams,
        textStyle: {
          color: 'gray',
        },
      },
      xAxis: {
        type: 'category',
        data: dateData,
        axisLabel: {
          textStyle: {
            color: 'gray',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          textStyle: {
            color: 'gray',
          },
        },
      },
      series: teams.map((team, index) => ({
        name: team,
        type: 'line',
        stack: '总分',
        data: scoreData.map(scores => scores[index]),
      })),

    };

    myChart.setOption(option);
   
    const resizeChart = () => {
      myChart.resize()
    }

    window.addEventListener('resize', resizeChart)

    // const dynamicChartTheme = () => {
    //   console.log('click')
    //   myChart.dispose()
    //   myChart = echarts.init(rankChart)
    //   myChart.setOption(option)
    // }

    // const darkModeToggler = document.querySelector('.darkmode-toggler')
    // darkModeToggler.addEventListener('click', dynamicChartTheme)

    const destroy = () => {
        myChart.dispose()
        window.removeEventListener('resize', resizeChart)
        // darkModeToggler.removeEventListener('click', dynamicChartTheme)
    }

    return destroy
}