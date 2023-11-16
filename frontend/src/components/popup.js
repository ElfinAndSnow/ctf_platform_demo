import '../assets/css/popup.css'
import { createChallengeSession, deleteChallengeSession, flagSubmission } from '../api/api'
export default {
    target: '.overlay',
    methods: {
        // 是否解出
        isSolved: function() {
            if (document.querySelector('.overlay').dataset.status === '1'){
                const input = document.getElementById('flag')
                input.disabled = true
                input.placehoder = 'this challenge was solved'
            }
        },
        // 展示会话视图
        showSessionView: function() {
            const content = document.querySelector('.content')
            content.innerHTML += '<b id="addr">题目地址：</b>'
            const addr = document.createElement('p')
            addr.innerText = sessionStorage.getItem('zctf-challenge-addr')
            document.getElementById('addr').after(addr)
            // 显示flag输入框
            document.querySelector('.popup>.input').style.display = 'block'
            // 显示会话销毁按钮
            document.getElementById('close').style.display = 'block'
            // 隐藏创建实例按钮
            document.getElementById('open').style.display = 'none'
        },
        // 若已有会话和本题会话相同，直接展示会话信息
        showExistedSession: function() {
            if (sessionStorage.getItem('zctf-challenge-id') === document.querySelector('.overlay').dataset.id){
                this.showSessionView()
            }
        },
        // 创建题目会话
        createSession: function() {
            // 使用闭包来避免this指向事件源 
            const self = this
            return async function() {
                // id是int型
                let res = await createChallengeSession(parseInt(document.querySelector('.overlay').dataset.id))
                // 若已有会话存在
                if (res?.status){
                    const flag = window.confirm('当前已有会话存在，是否销毁旧会话以创建该题会话')
                    if (flag){
                        // 销毁会话
                        await deleteChallengeSession()
                        // 再创建会话
                        res = await createChallengeSession(parseInt(document.querySelector('.overlay').dataset.id))
                    }
                    // 中止创建会话
                    else {
                        return
                    }
                }
                // 展示会话视图
                if (typeof res.address !== 'undefined') {
                    // 显示更多信息
                    sessionStorage.setItem('zctf-challenge-addr', res.address)
                    self.showSessionView(res.address)
                    // 会话存入sessionStorage
                    const overlay = document.querySelector('.overlay')
                    sessionStorage.setItem('zctf-challenge-id', overlay.dataset.id)
                    sessionStorage.setItem('zctf-challenge-title', overlay.dataset.title)
                    sessionStorage.setItem('zctf-challenge-description', overlay.dataset.ds)
                    sessionStorage.setItem('zctf-challenge-status', overlay.dataset.status)
                }
            }
        },
        // 提交flag
        submitFlag: async function() {
            const flag = document.getElementById('flag').value
            let result = await flagSubmission(flag)
            if (result){
                window.alert('flag正确！')
            }
            else {
                window.alert('flag错误！')
            }
        },
        // 销毁会话
        deleteSession: async function() {
            await deleteChallengeSession()
            // 隐藏flag输入框
            document.querySelector('.popup>.input').style.display = 'none'
            // 隐藏实例销毁按钮
            document.getElementById('close').style.display = 'none'
            // 显示实例开启按钮
            document.getElementById('open').style.display = 'block'
            // 移除题目地址
            const content = document.querySelector('.content')
            const p = content.querySelector('#addr+p')
            const addr = content.querySelector('#addr')
            if (typeof p !== 'undefined'){
                content.removeChild(p)
            }
            if (typeof addr !== 'undefined'){
                content.removeChild(addr)
            }
            // 销毁已有会话信息
            sessionStorage.removeItem('zctf-challenge-id')
            sessionStorage.removeItem('zctf-challenge-title')
            sessionStorage.removeItem('zctf-challenge-description')
            sessionStorage.removeItem('zctf-challenge-status')
        },  
            
    },
    template: `
            <div class="popup">
                <header>
                    <h1></h1>
                    <label>
                        <div class="line"></div>
                        <div class="line"></div>
                    </label>
                </header>
                <div class="hr"></div>
                <div class="content">
                    <b id='description'>描述：</b>
                    <p></p>
                </div>
                <div class="button" id="open">开启实例</div>
                <div class="button" id="close" style="display: none">销毁实例</div>
                <div class="input" style="display: none">
                    <textarea placeholder="Enter your flag" spellcheck="false" required id="flag"></textarea>
                    <div class="button">提交</div>
                </div>
            </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        const overlay = document.querySelector('.overlay')
        const popup = document.querySelector('.popup')
        
        // 填入题目基本详情
        popup.querySelector('h1').innerText = overlay.dataset.title
        popup.querySelector('#description+p').innerText = overlay.dataset.ds

        // 题未解出视图
        if (document.querySelector('.overlay').dataset.status === '0'){
            this.methods.showExistedSession()
            // 已解出则禁止输入
            this.methods.isSolved()
            // 开启实例按钮
            const createSessionFunc = () => {
                this.methods.createSession()
            }
            document.getElementById('open').addEventListener('click', this.methods.createSession())
            // 销毁实例按钮
            document.getElementById('close').addEventListener('click', this.methods.deleteSession)
            // 提交flag
            document.querySelector('#flag+.button').addEventListener('click', this.methods.submitFlag)
        }
        
        // 题已解出视图
        else {
            // 隐藏开启实例按钮
            document.getElementById('open').style.display = 'none'
            // 添加题目已被解出提示信息
            const p = document.createElement('p')
            p.setAttribute('id', 'prompt')
            p.innerText = '该题已被解出！'
            document.querySelector('.content').appendChild(p)
        }
        // 关闭会话
        popup.querySelector('.popup>header>label').addEventListener('click', this.destory)

    },
    destroyed: function() {
        if (document.querySelector('.overlay').dataset.status === '0'){
            document.getElementById('open').removeEventListener('click', this.methods.createSession())
            document.getElementById('close').removeEventListener('click', this.methods.deleteSession)
            document.querySelector('#flag+.button').removeEventListener('click', this.methods.submitFlag)
        }
        document.querySelector('.popup>header>label').removeEventListener('click', this.destory)
        // 移除弹窗
        document.body.removeChild(document.querySelector('.overlay'))
    }
}