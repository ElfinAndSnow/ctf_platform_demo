import '../assets/css/home.css'
/*
首页内容
1. 项目介绍
2. 贡献者成员以及分工
*/
export default {
    target: 'main',
    data: {
        typerID: undefined,
    },
    methods: {

    },
    template: `
        <div id="intro">
            <div id='qs'>
                <h1>What is ZCTF?</h1>
                <div id="typing" class="card"></div>
            </div>
            <div id="main"  class="card">
            </div>
        </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        const content = '你说的对，但ZCTF是由第七组自主研发的一款全新开发世界冒险游戏，游戏发生在一个被称作「 CTF world 」 的幻想世界，你将扮演一位名为「 CTFer 」的神秘角色，在自由的题目环境中邂逅性格各异、能力独特的「 teammates 」，和他们一起逐步发掘「 flag 」的真相。'
        const typing = document.getElementById('typing')
    
        let i = 0
        this.data.typerID = setInterval(()=>{
            typing.innerText += content[i]
            i++
            if (i === content.length){
                clearInterval(this.data.typerID)
            }
        }, 90)
    
    },
    destroyed: function() {
        clearInterval(this.data.typerID)
    }
}