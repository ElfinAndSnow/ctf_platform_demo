import {getChallengeList} from '../api/api.js'
import render from '../utils/render.js'
import '../assets/css/challenge.css'
/*
题库内容
1. 信息榜 （用户名、战队、队伍积分、解题数、排名）
2. 题目区 
    - 题目分类选择器 （All, Misc, Web, Reverse, Pwn, Crypto)
    - 题目框 （题目标题、分值、类别）
*/

export default {
    target: 'main',
    methods: {
        // 获取题目列表
        appendChallengeList: async function(page, type = 'all') {
            let challenges = await getChallengeList(page, type)
            const challengeList = document.getElementById('challenge-list')
            challenges.forEach(item => {
                // 添加题目信息
                challengeList.innerHTML += `
                    <div class="challenge-bar ${item.type.toLowerCase()} ${item.is_solved_by_current_user||item.is_solved_by_current_team?'issolved':''}" data-id="${item.id}" data-ds="${item.description}">
                        <h1>${item.name}</h1>
                        <div class="hr"></div>
                        <h2> ${item.points} pts </h2>
                    </div>
                `
            })
            // 显示总页数和题数
            const num = sessionStorage.getItem('zctf-challenge-num')
            // 每页最多10题
            document.querySelector('.pagenum').innerText = `共${parseInt(num/10)+1}页，总共${num}题`
        },
        showInfoBoard: () => {
            const userInfo = JSON.parse(sessionStorage.getItem('zctf-userinfo'))
            document.getElementById('username').innerText = userInfo.username || 'UserName'
            document.getElementById('team').innerText = userInfo.team || 'No Team'
            document.getElementById('score').innerText = userInfo.points || 'None Point'
            const solved = userInfo.solved_challenges.length
            document.getElementById('solved').innerText = String(solved)
        },
            // 分类器
        switchChallengeType: function() {
            const self = this
            return async function(e){
                // 防止同时点击多个标签出现报错
                if (document.getElementById('switch-bar')!==e.target){
                    console.log(e.target)
                    // 移除展示的题目
                    document.querySelectorAll('.challenge-bar').forEach(item => {
                        document.getElementById('challenge-list').removeChild(item)
                    })
                    // 标签激活状态变化
                    document.querySelector("#switch-bar .active").classList.remove("active")
                    e.target.classList.add("active")
                    // 获取题目列表
                    const type = e.target.innerText
                    await self.appendChallengeList(1, type)
                }
            }
            
        },
        // 调用弹窗
        popWindow: (e) => {
            if (e.target.classList.contains('challenge-bar')){
                // 创建弹窗，并render
                const overlay = document.createElement('section')
                overlay.classList.add('overlay')
                overlay.setAttribute('data-id', e.target.dataset.id)
                overlay.setAttribute('data-ds', e.target.dataset.ds)
                overlay.setAttribute('data-title', e.target.querySelector('h1').innerText)
                overlay.setAttribute('data-status', e.target.classList.contains('issolved')?'1':'0')
                document.body.appendChild(overlay)
                let popup = null
                import('../components/popup.js').then((module) => {
                    popup = render(module.default)
                    // 绑定题目id
                    document.querySelector('.popup').setAttribute('data-id', e.target.dataset.id)
                    // 绑定关闭弹窗
                    const destroy = () => {
                        // 让this指向popup本身,直接绑定监听this会指向label
                        popup.destroyed()
                    }
                    document.querySelector('.popup>header>label').addEventListener('click', destroy)
                })
            }                                                                          
        },
        
    },
    template: `
        <div class="view">
            <div id="aside-bar" class="card">
                <h1 id="username"></h1>
                <h3 id="team"></h3>
                <div class="hr"></div>
                <h1 id="score"></h1>
                <h3>SCORE</h3>
                <div class="hr"></div>
                <h1 id="rank"></h1>
                <h3>TOTAL RANK</h3>
                <div class="hr"></div>
                <h1 id="solved"></h1>
                <h3>SOLVED</h3>
            </div>
            <div id="challenge-bank" class="card">
                <div id="switch-bar">
                    <a class="active" data-filter="all">All</a><div class="vl"></div>
                    <a data-filter="misc">Misc</a><div class="vl"></div>
                    <a data-filter="web">Web</a><div class="vl"></div>
                    <a data-filter="reverse">Reverse</a><div class="vl"></div>
                    <a data-filter="pwn">Pwn</a><div class="vl"></div>
                    <a data-filter="crypto">Crypto</a>
                </div>
                <div class="hr"></div>
                <div id="challenge-list"></div>
                <p class="pagenum"></p>
                <div class="pagination" id="">
                    <div class="page-switcher" id="prev">&lt;</div>
                    <div class="page-switcher" id="page">1</div>
                    <div class="page-switcher" id="next">&gt;</div>
                </div>
                <form class="pageinput" style="display: none">
                    <input type="text" placeholder="页码">
                    <button>确认</button>
                </form>
            </div>
        </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        this.methods.switchChallengeType = this.methods.switchChallengeType()
        // 获取首页题目列表并渲染
        this.methods.appendChallengeList(1)
        // 渲染信息板
        this.methods.showInfoBoard()

        const switchBar = document.getElementById("switch-bar");
        switchBar.addEventListener('click', this.methods.switchChallengeType)
        document.getElementById('challenge-list').addEventListener('click', this.methods.popWindow)
    },
    destroyed: function() {
        document.getElementById('switch-bar').removeEventListener('click', this.methods.switchChallengeType)
        document.getElementById('challenge-list').removeEventListener('click', this.methods.popWindow)
    }
}