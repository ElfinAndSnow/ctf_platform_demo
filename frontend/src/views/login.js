import '../assets/css/login.css'
import {login, register} from '../api/api.js'

export default {
    target: 'main',
    data: {

    },
    methods: {
        // 登录/注册视图转化
        switcher: (e) => {
            document.querySelector('#header .active').classList.remove('active')
            e.target.classList.add('active')
    
            document.querySelector('#inputarea form.hide').classList.remove('hide')
            const form = document.getElementById(e.target.dataset.type)
            form.classList.add('hide')
            form.querySelectorAll('forminput>input').forEach(item => {
                item.value = ''
            })
        },
        // 清除用户名存在提示
        removeAlert: () => {
            document.querySelector('[name="usernametoregister"]+.alert').innerHTML = ''
        },
        // 检测邮箱格式
        checkEmailFormat: (e) => {
            const alert = document.querySelector('[name="email"]+.alert')
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
            // 格式有误
            if (!emailRegex.test(e.target.value)&&e.target.value!==''){
                alert.innerHTML = '*请输入正确的邮箱格式'
            }
            // 格式无误
            else {
                alert.innerHTML = ''
            }
        },
        // 检测密码规范
        checkStrongPwd: (e) => {
            const alert = document.querySelector('[name="pwdtoregister"]+.alert')
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+[\]{};:'",.<>/?\\|~`-]{8,}$/
            const pwd = e.target.value

            if ((passwordRegex.test(pwd))||pwd==='') {
                alert.innerHTML = ''
            }
            else {
                alert.innerHTML = '*密码长度要大于7；不能使用纯数字做密码'
            }
        },
        // 检测两次密码一致性
        checkConfirmedPwd: (e) => {
            const pwd = document.querySelector('[name="pwdtoregister"]').value
            const alert = document.querySelector('[name="pwdtoconfirm"]+.alert')
            if (pwd !== e.target.value&&e.target.value !== '') {
                alert.innerHTML = '*两次密码不一致！'
            }
            else {
                alert.innerHTML = ''
            }
        },
        // 密码可见性转换
        changeVisibility: (e) => {
            const input = document.getElementById(e.target.dataset.id)
            input.querySelector('.hide').classList.remove('hide')
            e.target.classList.add('hide')
            input.querySelector('input').setAttribute('type', e.target.dataset.type)
        },
        // 发送登录表单
        sendLoginForm: () => {
            const loginForm = document.getElementById("loginform");
            const username = loginForm.querySelector('[name="usernametologin"]').value;
            const password = loginForm.querySelector('[name="pwdtologin"]').value;
    
            const data = {
                username,
                password
            }
    
            login(data, loginForm.querySelector('[name="pwdtologin"]+.alert'))
        },
        // 发送注册表单
        sendRegisterForm: () => {
            const registerForm = document.getElementById('registerform')
            const username = registerForm.querySelector('[name="usernametoregister"]').value
            const email = registerForm.querySelector('[name="email"]').value
            const password = registerForm.querySelector('[name="pwdtoregister"]').value
            const confirm_password = registerForm.querySelector('[name="pwdtoconfirm"]').value
            // 信息不全，阻止表单发送
            if (!username||!email||!password||!confirm_password){
                window.alert('请将信息填全！')
                return
            }
            const data = {
                username,
                email,
                password,
                confirm_password
            }
            register(data, 'loginbar',registerForm.querySelector('[name="usernametoregister"]+.alert'),registerForm.querySelector('[name="email"]+.alert'),registerForm.querySelector('[name="pwdtoregister"]+.alert'),registerForm.querySelector('[name="pwdtoconfirm"]+.alert'))
        }
    },
    template: `
        <div id="inputarea"  class="card">
            <div id="header">
                <div id="loginbar" class="active" data-type="registerform">登录</div>
                <div id="registerbar" data-type="loginform">注册</div>
            </div>
            <div class="hr"></div>
            <form id="loginform">
                <div class="forminput">
                    <label for="usernametologin">用户名:</label>
                    <input type="text" placeholder="Your Name..." name="usernametologin">
                    <div class="alert"></div>
                </div>
                <div class="forminput" id="pwdtologin">
                    <label for="pwdToLogin">密码:</label>
                    <input type="password" placeholder="Your Password..." name="pwdtologin">
                    <div class="alert"></div>
                    <svg t="1698326560385" data-id="pwdtologin" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                    <svg t="1698334223239" data-id="pwdtologin" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                </div>
                <div id="loginbtn" class="button">登录</div>
            </form>
            <form id="registerform" class="hide">
                <div class="forminput">
                    <label for="usernametoregister">用户名:</label>
                    <input type="text" placeholder="Your Name..." name="usernametoregister">
                    <div class="alert"></div>
                </div>
                <div class="forminput">
                    <label for="email">邮箱:</label>
                    <input type="text" placeholder="Your Email..." name="email">
                    <div class="alert"></div>
                </div>
                <div class="forminput" id="pwdtoregister">
                    <label for="pwdtoregister">密码:</label>
                    <input type="password" placeholder="Your Password..." name="pwdtoregister">
                    <div class="alert"></div>
                    <svg t="1698326560385" data-id="pwdtoregister" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                    <svg t="1698334223239" data-id="pwdtoregister" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                </div>
                <div class="forminput" id="pwdtoconfirm">
                    <label for="pwdtoconfirm">确认密码:</label>
                    <input type="password" placeholder="Your Confirmed Password..." name="pwdtoconfirm">
                    <div class="alert"></div>
                    <svg t="1698326560385" data-id="pwdtoconfirm" data-type="text" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1305"><path d="M512.648533 750.933333c-146.090667 0-277.538133-86.2208-338.5344-222.3104-3.8912-11.639467-3.8912-21.6064 0.9216-35.6352C235.1104 359.287467 366.592 273.066667 512.6144 273.066667c146.090667 0 277.572267 86.2208 338.5344 222.3104 3.8912 11.639467 3.8912 21.6064-0.9216 35.6352C790.186667 664.712533 658.705067 750.933333 512.682667 750.933333zM221.866667 510.088533c51.882667 115.4048 165.0688 189.6448 290.781866 189.6448s238.933333-74.24 289.860267-187.2896c0.341333-1.1264 0.341333 0.170667 0.853333 1.365334l0.034134 0.1024C751.547733 398.506667 638.327467 324.266667 512.682667 324.266667c-125.713067 0-238.933333 74.24-289.860267 187.2896-0.375467 1.1264-0.375467-0.170667-0.887467-1.365334v-0.1024z m290.781866 134.178134A131.345067 131.345067 0 0 1 380.1088 512a131.345067 131.345067 0 0 1 132.539733-132.266667A131.345067 131.345067 0 0 1 645.12 512a131.345067 131.345067 0 0 1-132.5056 132.266667z m0-51.2c45.6704 0 81.237333-35.498667 81.237334-81.066667a80.110933 80.110933 0 0 0-81.237334-81.066667A80.110933 80.110933 0 0 0 431.4112 512a80.110933 80.110933 0 0 0 81.237333 81.066667z" p-id="1306"></path></svg>
                    <svg t="1698334223239" data-id="pwdtoconfirm" data-type="password" class="icon hide" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1507"><path d="M804.522667 533.947733l40.516266 80.213334a26.965333 26.965333 0 1 1-48.128 24.302933l-40.6528-80.554667c-24.1664 10.8544-48.3328 19.968-72.533333 27.3408l14.5408 66.730667a26.965333 26.965333 0 0 1-52.6336 11.4688l-14.199467-64.955733c-25.088 5.085867-50.244267 8.260267-75.434666 9.6256v76.3904a26.965333 26.965333 0 0 1-53.896534 0v-76.3904a520.533333 520.533333 0 0 1-74.990933-9.557334l-15.2576 65.1264a26.965333 26.965333 0 1 1-52.462933-12.288l15.4624-66.013866a614.877867 614.877867 0 0 1-72.977067-27.477334l-40.686933 80.554667a26.965333 26.965333 0 1 1-48.128-24.302933l40.5504-80.213334c-17.92-9.796267-35.805867-20.48-53.6576-32.187733a26.965333 26.965333 0 0 1 29.457066-45.124267c100.590933 65.706667 200.362667 98.304 299.656534 98.304s199.031467-32.597333 299.656533-98.304a26.965333 26.965333 0 0 1 29.457067 45.124267c-17.851733 11.6736-35.771733 22.391467-53.6576 32.187733z" p-id="1508"></path></svg>
                </div>
                <div id="registerbtn"  class="button">注册</div>
            </form>
        </div>
    `,
    afterMount: function() {
        document.getElementById('header').addEventListener('click', this.methods.switcher)
        document.querySelector('[name="usernametoregister"]').addEventListener('input', this.methods.removeAlert)
        document.querySelector('[name="email"]').addEventListener('input', this.methods.checkEmailFormat)
        document.querySelectorAll('.forminput>svg').forEach(item => {
            item.addEventListener('click', this.methods.changeVisibility)
        })
        document.querySelector('[name="pwdtoregister"]').addEventListener('input', this.methods.checkStrongPwd)
        document.querySelector('[name="pwdtoconfirm"]').addEventListener('input', this.methods.checkConfirmedPwd)
        document.getElementById('loginbtn').addEventListener('click', this.methods.sendLoginForm)
        document.getElementById('registerbtn').addEventListener('click', this.methods.sendRegisterForm)
    },
    destroyed: function() {
        document.getElementById('header').removeEventListener('click', this.methods.switcher)
        document.querySelector('[name="usernametoregister"]').removeEventListener('input', this.methods.removeAlert)
        document.querySelector('[name="email"]').removeEventListener('input', this.methods.checkEmailFormat)
        document.querySelectorAll('.forminput>svg').forEach(item => {
            item.removeEventListener('click', this.methods.changeVisibility)
        })
        document.querySelector('[name="pwdtoregister"]').removeEventListener('input', this.methods.checkStrongPwd)
        document.querySelector('[name="pwdtoconfirm"]').removeEventListener('input', this.methods.checkConfirmedPwd)
        document.getElementById('loginbtn').removeEventListener('click', this.methods.sendLoginForm)
        document.getElementById('registerbtn').removeEventListener('click', this.methods.sendRegisterForm)
    }
}