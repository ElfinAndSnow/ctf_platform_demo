export default function initChallenges() {
    const main = document.querySelector('main')
    main.innerHTML = `
        <div id="aside-bar">
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
        <div id="challenge-bank">
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

    `

    const switchBar = document.getElementById("switch-bar");
    const filterableCards = document.querySelectorAll(".challenge-bar");

    const filterCards = (e) => {
        document.querySelector("#switch-bar .active").classList.remove("active");
        e.target.classList.add("active")

        filterableCards.forEach(card => {
            if(card.classList.contains(e.target.dataset.filter) || e.target.dataset.filter === "all") {
                return card.classList.remove('hide')
            }
            card.classList.add("hide")
        })

    }

    switchBar.addEventListener('click', filterCards)

    const destroy = () => {
        switchBar.removeEventListener('click', filterCards)
    }

    return destroy
}