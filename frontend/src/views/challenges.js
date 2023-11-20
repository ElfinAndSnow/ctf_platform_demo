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
        appendChallengeList: async function(page, type = 'All') {
            let challenges = await getChallengeList(page, type)
            const challengeList = document.getElementById('challenge-list')
            challenges.forEach(item => {
                // 添加题目信息
                challengeList.innerHTML += `
                    <div class="challenge-bar ${item.type.toLowerCase()} ${item.is_solved_by_current_user||item.is_solved_by_current_team?'issolved':''}" data-id="${item.id}" data-ds="${item.description}" data-file="${item.has_file?'1':'0'}">
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
        // 信息板渲染
        showInfoBoard: () => {
            if (typeof sessionStorage.getItem('zctf-userinfo') !== 'undefined'){
                const userInfo = JSON.parse(sessionStorage.getItem('zctf-userinfo'))
                document.getElementById('username').innerText = userInfo.username || 'UserName'
                document.getElementById('team').innerText = userInfo.team || 'No Team'
                document.getElementById('score').innerText = userInfo.points
                const solved = userInfo.solved_challenges.length
                document.getElementById('solved').innerText = solved
            }
        },
        // 分类器
        switchChallengeType: function() {
            const self = this
            return async function(e){
                // 防止同时点击多个标签出现报错
                if (document.getElementById('switch-bar')!==e.target){
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
        popChallengeDetail: function(e) {
            const self = this
            return (e) => {
                if (e.target.classList.contains('challenge-bar')){
                    // 创建弹窗，并render
                    const overlay = document.createElement('section')
                    overlay.classList.add('overlay')
                    overlay.setAttribute('data-id', e.target.dataset.id)
                    overlay.setAttribute('data-ds', e.target.dataset.ds)
                    overlay.setAttribute('data-title', e.target.querySelector('h1').innerText)
                    overlay.setAttribute('data-status', e.target.classList.contains('issolved')?'1':'0')
                    overlay.setAttribute('data-file', e.target.dataset.file)
                    document.body.appendChild(overlay)
                    import(/* webpackChunkName: "popup" */ '../components/popup.js').then((module) => {
                        self.popup = render(module.default)
                        // 绑定关闭弹窗
                        document.querySelector('.popup>header>label').addEventListener('click', self.popup.destroyed)
                    })
                }                                                              
            }            
        },
        // 页面跳转
        pageShift: async function(page) {
            // 判断页码合法性
            if (page < 1 || page > parseInt(sessionStorage.getItem('zctf-challenge-num')/10)+1){
                window.alert('不存在该页面')
                return
            }
            // 移除展示的题目
            document.querySelectorAll('.challenge-bar').forEach(item => {
                document.getElementById('challenge-list').removeChild(item)
            })
            // 获取题目列表
            const type = document.querySelector('.active').innerText
            await this.appendChallengeList(page, type)
            // 显示新页码
            document.getElementById('page').innerText = page
        },
        // 上一页
        toPrev: function() {
            const self = this
            return async function() {
                const page = document.getElementById('page').innerText - 1
                self.pageShift(page)
            }
        },
        // 下一页
        toNext: function() {
            const self = this
            return async function() {
                const page = document.getElementById('page').innerText + 1
                console.log(page)
                self.pageShift(page)
            }
        },
        // 显示页码输入框
        showPageInput: function(e) {
            const input = document.querySelector('#challenge-bank>form')
            input.style.display = 'flex'
            // 默认填入当前页码
            input.querySelector('input').value = e.target.innerText
        },
        // 隐藏页码输入框
        hidePageInput: function(e) {
            const pageInput = document.querySelector('#challenge-bank>form')
            if (!pageInput.contains(e.target)&&e.target!==document.getElementById('page')){
                pageInput.style.display = 'none'
            }
        },
        // 跳转至指定页码
        toAllocated: function() {
            const self = this
            return async function(e) {
                const page = e.target.previousElementSibling.value
                self.pageShift(page)
            }
        }
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
                    <a class="active">All</a><div class="vl"></div>
                    <a>Misc</a><div class="vl"></div>
                    <a>Web</a><div class="vl"></div>
                    <a>Reverse</a><div class="vl"></div>
                    <a>Pwn</a><div class="vl"></div>
                    <a>Crypto</a>
                </div>
                <div class="hr"></div>
                <div id="challenge-list"></div>
                <p class="pagenum"></p>
                <div class="pagination" id="">
                    <div class="page-switcher" id="prev">&lt;</div>
                    <div class="page-switcher" id="page">1</div>
                    <div class="page-switcher" id="next">&gt;</div>
                </div>
                <form class="pageinput card" style="display: none">
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
        // 放置swichChallengeTypeView返回的函数
        this.methods.switchChallengeTypeView = this.methods.switchChallengeType()
        this.methods.turnToPrev = this.methods.toPrev()
        this.methods.turnToNext = this.methods.toNext()
        this.methods.turnToAllocated = this.methods.toAllocated()
        this.methods.popWindow = this.methods.popChallengeDetail()
        // 获取首页题目列表并渲染
        this.methods.appendChallengeList(1)
        // 渲染信息板
        this.methods.showInfoBoard()

        const switchBar = document.getElementById("switch-bar");
        switchBar.addEventListener('click', this.methods.switchChallengeTypeView)
        document.getElementById('challenge-list').addEventListener('click', this.methods.popWindow)
        document.getElementById('prev').addEventListener('click', this.methods.turnToPrev)
        document.getElementById('next').addEventListener('click', this.methods.turnToNext)
        document.getElementById('page').addEventListener('click', this.methods.showPageInput)
        document.querySelector('form>button').addEventListener('click', this.methods.turnToAllocated)
        document.addEventListener('click', this.methods.hidePageInput)
    },
    destroyed: function() {
        document.getElementById('switch-bar').removeEventListener('click', this.methods.switchChallengeTypeView)
        document.getElementById('challenge-list').removeEventListener('click', this.methods.popWindow)
        document.getElementById('prev').removeEventListener('click', this.methods.turnToPrev)
        document.getElementById('next').removeEventListener('click', this.methods.turnToNext)
        document.getElementById('page').removeEventListener('click', this.methods.showPageInput)
        document.querySelector('form>button').removeEventListener('click', this.methods.turnToAllocated)
        document.removeEventListener('click', this.methods.hidePageInput)
        if (typeof document.querySelector('.overlay') !== 'undefined'){
            this.methods.popup.destroyed()
        }
    }
}