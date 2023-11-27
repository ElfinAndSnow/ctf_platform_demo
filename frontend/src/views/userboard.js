import '../assets/css/userboard.css'
import '../assets/css/login.css'
import { resetUsername, getEmailVerification, resetPwd } from '../api/api'

export default {
    target: 'main',
    methods: {
        showInfo: () => {
            const userInfo = JSON.parse(sessionStorage.getItem('zctf-userinfo'))
            document.querySelector('#user-name>b').innerText = userInfo.username
            document.querySelector('#solved-num>p').innerText = userInfo.solved_challenges.length
            document.querySelector('#points>p').innerText = userInfo.points
            document.querySelector('#rate>p').innerText = userInfo.ranking
            document.querySelector('#id>p').innerText = userInfo.id
            document.querySelector('#status>p').innerHTML = userInfo.is_email_verified ? '<b style="color: green">已激活</b>' : '<b style="color: red">未激活</b>'
            document.querySelector('#team>p').innerText = userInfo.team_name || 'No Team'
            const date = new Date(userInfo.date_joined)
            document.querySelector('#fs-login>p').innerText = date.getFullYear() + ' ' + date.getMonth() + '-' + date.getDate()
        },
        resetName: async () => {
            const newName = window.prompt('请输入新的用户名：')
            if (newName === ''){
                window.alert('用户名不可为空！')
            }
            else if (newName !== null){
                const flag = await resetUsername(newName)
                if (flag){
                    document.querySelector('#user-name>b').innerText = JSON.parse(sessionStorage.getItem('zctf-userinfo')).username
                }
            }
        },
        showInput: () => {
            document.getElementById('revisepwd').style.display = 'none'
            document.querySelector('#revise>form').style.display = 'block'
        },
        hideInput: () => {
            document.querySelector('#revise>form').style.display = 'none'
            document.getElementById('revisepwd').style.display = 'block'
        },
        // 密码可见性转换
        changeVisibility: (e) => {
            const input = document.getElementById(e.target.dataset.id)
            input.querySelector('.hide').classList.remove('hide')
            e.target.classList.add('hide')
            input.querySelector('input').setAttribute('type', e.target.dataset.type)
        },
        // 检测两次密码一致性
        checkConfirmedPwd: (e) => {
            const pwd = document.querySelector('[name="newpwd"]').value
            const alert = document.querySelector('[name="pwdtoconfirm"]+.alert')
            if (pwd !== e.target.value&&e.target.value !== '') {
                alert.innerHTML = '*两次密码不一致！'
            }
            else {
                alert.innerHTML = ''
            }
        },
        // 检测密码规范
        checkStrongPwd: (e) => {
            const alert = document.querySelector('[name="newpwd"]+.alert')
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{};:'",.<>/?\\|~`-]{8,}$/
            const pwd = e.target.value

            if ((passwordRegex.test(pwd))||pwd==='') {
                alert.innerHTML = ''
            }
            else {
                alert.innerHTML = '*密码长度要大于7；不能使用纯数字做密码'
            }
        },
        getVerificationCode: function() {
            const self = this
            return async function(e){
                // 判断是否可点击
                if (e.target.dataset.enable === '0'){
                    return 
                }
                const flag = await getEmailVerification('password_reset')
                // 若成功
                if (!flag){
                    // 提示
                    window.alert('验证码已发送至您的邮箱')
                    // 禁止点击
                    e.target.dataset.enable = '0'
                    e.target.style.backgroundColor = '#787878'
                    let scd = 120
                    self.id = setInterval(()=>{
                        scd--
                        e.target.innerText = `${scd}s`
                        if (scd <= 0){
                            clearInterval(self.id)
                            e.target.dataset.enable = '1'
                            e.target.style.backgroundColor = '#818CF8'
                            e.target.innerText = '获取验证码'
                        }
                    }, 1000)
                }
            }
            
        },
        resetPwd: async () => {
            const current_password = document.querySelector('[name="pwd"]').value
            const new_password = document.querySelector('[name="newpwd"]').value
            const confirm_new_password = document.querySelector('[name="pwdtoconfirm"]').value
            const verify_code = document.querySelector('[name="vfcode"]').value
            if (current_password==='' || new_password === '' || confirm_new_password === '' || verify_code === ''){
                window.alert('请填完再确定！')
                return
            }
            const data = {
                current_password,
                new_password,
                confirm_new_password,
                verify_code: {
                  verify_code,
                  verify_purpose: "password_reset"
                }
            }
            const flag = await resetPwd(data)
            if (flag){
                document.getElementById('cancel').click()
            }
        }

    },
    template: `
        <div id="userboard" class="card">
            <div id="user-info">
                <div id="user-name" class="item">
                    <b></b>
                    <a title="修改用户名"><svg t="1700977891703" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4057"><path d="M922.048 910.72a34.496 34.496 0 0 1-29.376 15.808H130.24a34.496 34.496 0 0 1-29.376-15.808 29.824 29.824 0 0 1 0-31.68 34.432 34.432 0 0 1 29.376-16.064h762.368a34.432 34.432 0 0 1 29.376 15.808 29.696 29.696 0 0 1 0.064 31.936z m-388.672-247.104a234.624 234.624 0 0 1-128 59.328l-82.688 6.912c-40.064 3.264-62.08 5.12-66.24 5.12a32.384 32.384 0 0 1-22.72-9.344c-10.816-10.752-10.816-10.752-4.352-88.768l6.912-82.56a234.688 234.688 0 0 1 59.392-128l304.128-303.808a97.984 97.984 0 0 1 134.848 0l102.848 102.784a95.168 95.168 0 0 1 0 134.4z m259.136-393.6l-102.912-102.784a32 32 0 0 0-44.8 0l-304 303.744a169.28 169.28 0 0 0-40.96 88.384l-6.976 82.496-2.176 26.752 26.752-2.176 82.688-6.912a169.728 169.728 0 0 0 88.384-40.96l304.064-303.744a32 32 0 0 0-0.128-44.8z" p-id="4058"></path></svg></a>
                </div>
                <div id="solved-num" class="item">
                    <b>已解题数</b>
                    <p></p>
                </div>
                <div id="points" class="item">
                    <b>积分</b>
                    <p></p>
                </div>
                <div id="rate" class="item">
                    <b>排名</b>
                    <p></p>
                </div>
            </div>
            <div id="id" class="list">
                <b>用户id：</b>
                <p></p>
            </div>
            <div id="status" class="list">
                <b>激活状态：</b>
                <p></p>
            </div>
            <div id="team" class="list">
                <b>所属战队：</b>
                <p></p>
            </div>
            <div id="fs-login" class="list">
                <b>首次登录：</b>
                <p></p>
            </div>
            <div id="revise">
                <div class="button" id="revisepwd">修改密码</div>
                <form style="display: none">
                    <div class="forminput" id="oldpwd">
                        <label for="pwd">原密码:</label>
                        <input type="password" placeholder="Original Password..." name="pwd">
                        <div class="alert"></div>
                        <svg t="1698326560385" data-id="oldpwd" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                        <svg t="1698334223239" data-id="oldpwd" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                    </div>
                    <div class="forminput" id="newpwd">
                        <label for="newpwd">新密码:</label>
                        <input type="password" placeholder="New Password..." name="newpwd">
                        <div class="alert"></div>
                        <svg t="1698326560385" data-id="newpwd" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                        <svg t="1698334223239" data-id="newpwd" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                    </div>
                    <div class="forminput" id="newpwdtoconfirm">
                        <label for="pwdtoconfirm">确认密码:</label>
                        <input type="password" placeholder="Confirmed Password..." name="pwdtoconfirm">
                        <div class="alert"></div>
                        <svg t="1698326560385" data-id="newpwdtoconfirm" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                        <svg t="1698334223239" data-id="newpwdtoconfirm" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                    </div>
                    <div class="forminput" id="activatedcode">
                        <label for="vfcode">验证码:</label>
                        <input type="text" placeholder="Activated Code..." name="vfcode">
                        <div class="alert"></div>
                        <div class="button" id="verify">获取验证码</div>
                    </div>
                    <div class="ops">
                        <div class="button" id="confirm">确定</div>
                        <div class="button" id="cancel">取消</div>
                    </div>
                </form>
            </div>
        </div>
        
    `,
    afterMount: function() {
        this.methods.showInfo()
        this.methods.getVfCode = this.methods.getVerificationCode()
        document.querySelector('#user-name>a').addEventListener('click', this.methods.resetName)
        document.getElementById('revisepwd').addEventListener('click', this.methods.showInput)
        document.getElementById('cancel').addEventListener('click', this.methods.hideInput)
        document.querySelectorAll('.forminput>svg').forEach(item => {
            item.addEventListener('click', this.methods.changeVisibility)
        })
        document.querySelector('[name="newpwd"]').addEventListener('input', this.methods.checkStrongPwd)
        document.querySelector('[name="pwdtoconfirm"]').addEventListener('input', this.methods.checkConfirmedPwd)
        document.getElementById('verify').addEventListener('click', this.methods.getVfCode)
        document.getElementById('confirm').addEventListener('click', this.methods.resetPwd)
    },
    destroyed: function() {
        document.querySelector('#user-name>a').removeEventListener('click', this.methods.resetName)
        document.getElementById('revisepwd').removeEventListener('click', this.methods.showInput)
        document.getElementById('cancel').removeEventListener('click', this.methods.hideInput)
        document.querySelectorAll('.forminput>svg').forEach(item => {
            item.removeEventListener('click', this.methods.changeVisibility)
        })
        document.querySelector('[name="newpwd"]').removeEventListener('input', this.methods.checkStrongPwd)
        document.querySelector('[name="pwdtoconfirm"]').removeEventListener('input', this.methods.checkConfirmedPwd)
        document.getElementById('verify').removeEventListener('click', this.methods.getVfCode)
        document.getElementById('confirm').removeEventListener('click', this.methods.resetPwd)
        if (typeof this.methods.id !== 'undefined'){
            clearInterval(this.methods.id)
        }
    }
}