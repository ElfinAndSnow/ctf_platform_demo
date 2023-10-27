import {verify} from '../api/api.js'
import '../assets/css/challenge.css'

export default {
    target: 'main',
    data: {

    },
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
    
        }
    },
    template: `
        <div id="aside-bar" class="card">
            <h1>UserName</h1>
            <h3>TEAM</h3>
            <div class="hr"></div>
            <h1>XXX</h1>
            <h3>SCORE</h3>
            <div class="hr"></div>
            <h1>XXX</h1>
            <h3>TOTAL RANK</h3>
            <div class="hr"></div>
            <h1>XXX</h1>
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
                <div class="challenge-bar misc">
                    <h1>Title is too long to see</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar web">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar reverse">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar pwn">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar crypto">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
                <div class="challenge-bar">
                    <h1>Title</h1>
                    <div class="hr"></div>
                    <h2> 100 pts </h2>
                </div>
             </div>
        <div id="page-navigation">
        </div>
        </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        const switchBar = document.getElementById("switch-bar");
        switchBar.addEventListener('click', this.methods.filterCards)
    },
    destroyed: function() {
        document.getElementById('switch-bar').removeEventListener('click', this.methods.filterCards)
        console.log('destoryed')
    }
}