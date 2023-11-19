import '../assets/css/popup.css'
import { createChallengeSession, deleteChallengeSession, submitFlag, downloadFile } from '../api/api'
export default {
    target: '.overlay',
    methods: {
        // 展示会话视图
        showSessionView: function() {
            const content = document.querySelector('.content')
            // 如有附件，显示下载按钮
            if (document.querySelector('.overlay').dataset.file === '1'){
                document.getElementById('download').style.display = 'block'
            }
            //如有地址，显示地址
            if (typeof sessionStorage.getItem('zctf-challenge-addr') !== 'undefined'){
                const addr = document.querySelector('#addr+p')
                addr.style.display = 'block'
                addr.innerText = sessionStorage.getItem('zctf-challenge-addr')
            }
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
                if (res?.status === '1'){
                    const flag = window.confirm('当前已有开启的实例存在，是否销毁已有实例以创建该题实例')
                    if (flag){
                        // 销毁会话
                        await deleteChallengeSession()
                        // 再创建会话
                        await self.openSession()
                    }
                    // 中止创建会话
                    return
                }
                else if (res?.status === '2'){
                    window.alert(res.detail)
                }
                // 展示会话视图
                if (typeof res?.address !== 'undefined') {
                    // 显示更多信息
                    sessionStorage.setItem('zctf-challenge-addr', res.address)
                    self.showSessionView()
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
            await submitFlag(flag)
        },
        // 销毁会话
        deleteSession: async function() {
            const res = await deleteChallengeSession()
            // 删除成功
            if (res?.status){
                // 隐藏flag输入框
                document.querySelector('.popup>.input').style.display = 'none'
                // 隐藏实例销毁按钮
                document.getElementById('close').style.display = 'none'
                // 显示实例开启按钮
                document.getElementById('open').style.display = 'block'
                // 移除题目地址
                document.getElementById('addr').style.display = 'none'
                document.querySelector('#addr+p').innerText = ''
                // 移除文件下载按钮
                if (document.querySelector('.overlay').dataset.file === '1'){
                    document.getElementById('download').style.display = 'none'
                }
                // 销毁已有会话信息
                sessionStorage.removeItem('zctf-challenge-id')
                sessionStorage.removeItem('zctf-challenge-title')
                sessionStorage.removeItem('zctf-challenge-description')
                sessionStorage.removeItem('zctf-challenge-status')
            }
            else {
                window.alert(res.detail)
            }
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
                    <a id="download" style="display: none">下载附件</a>
                    <b id="addr" style="display: none">题目地址：</b>
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
        // 放置createSession返回的函数
        this.methods.openSession = this.methods.createSession()
        
        // 填入题目基本详情
        popup.querySelector('h1').innerText = overlay.dataset.title
        popup.querySelector('#description+p').innerText = overlay.dataset.ds

        // 题未解出视图
        if (document.querySelector('.overlay').dataset.status === '0'){
            this.methods.showExistedSession()
            // 下载附件按钮
            document.getElementById('download').addEventListener('click', downloadFile)
            // 开启实例按钮
            document.getElementById('open').addEventListener('click', this.methods.openSession)
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
            document.getElementById('open').removeEventListener('click', this.methods.openSession)
            document.getElementById('close').removeEventListener('click', this.methods.deleteSession)
            document.querySelector('#flag+.button').removeEventListener('click', this.methods.submitFlag)
            const download = document.getElementById('download')
            if (typeof download !== 'undefined'){
                download.removeEventListener('click', downloadFile)
            }
        }
        document.querySelector('.popup>header>label').removeEventListener('click', this.destoryed)
        // 移除弹窗
        document.body.removeChild(document.querySelector('.overlay'))
    }
}