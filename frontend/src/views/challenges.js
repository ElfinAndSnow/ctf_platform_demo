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
        filterCards : (e) => {
            document.querySelector("#switch-bar .active").classList.remove("active")
            const filterableCards = document.querySelectorAll(".challenge-bar");
            e.target.classList.add("active")
    
            filterableCards.forEach(card => {
                if(card.classList.contains(e.target.dataset.filter) || e.target.dataset.filter === "all") {
                    return card.classList.remove('hide')
                }
                card.classList.add("hide")
            })
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
        appendChallengeList: async function(page) {
            let challenges = await getChallengeList(page)
            const challengeList = document.getElementById('challenge-list')
            challenges.forEach(item => {
                challengeList.innerHTML += `
                    <div class="challenge-bar ${item.type.toLowerCase()} ${item.is_solved_by_current_user||item.is_solved_by_current_team?'issolved':''}" data-id="${item.id}" data-ds="${item.description}">
                        <h1>${item.name}</h1>
                        <div class="hr"></div>
                        <h2> ${item.points} pts </h2>
                    </div>
                `
            })
        },
        showInfoBoard: () => {
            const userInfo = JSON.parse(sessionStorage.getItem('zctf-userinfo'))
            console.log(userInfo)
            document.getElementById('username').innerText = userInfo.username || 'UserName'
            document.getElementById('team').innerText = userInfo.team || 'No Team'
            document.getElementById('score').innerText = userInfo.points || 'None Point'
            const solved = userInfo.solved_challenges.length
            document.getElementById('solved').innerText = String(solved)
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
                <a class="active" data-filter="all">All</a><div class="vl"></div>
                <a data-filter="misc">Misc</a><div class="vl"></div>
                <a data-filter="web">Web</a><div class="vl"></div>
                <a data-filter="reverse">Reverse</a><div class="vl"></div>
                <a data-filter="pwn">Pwn</a><div class="vl"></div>
                <a data-filter="crypto">Crypto</a>
            </div>
            <div class="hr"></div>
            <div id="challenge-list">
                <div class="challenge-bar misc issolved">
                    <h1>Title is too long to see</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar web issolved">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar reverse issolved">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar pwn issolved">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar crypto issolved">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
             </div>
        <div id="page-navigation">
        </div>
        </div>
        </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        // 获取首页题目列表并渲染
        this.methods.appendChallengeList(1)
        // 渲染信息板
        this.methods.showInfoBoard()

        const switchBar = document.getElementById("switch-bar");
        switchBar.addEventListener('click', this.methods.filterCards)
        document.getElementById('challenge-list').addEventListener('click', this.methods.popWindow)
    },
    destroyed: function() {
        document.getElementById('switch-bar').removeEventListener('click', this.methods.filterCards)
        document.getElementById('challenge-list').removeEventListener('click', this.methods.popWindow)
    }
}