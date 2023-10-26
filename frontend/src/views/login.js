import '../assets/css/login.css'
import {login, register} from '../api/api.js'

export default {
    target: 'main',
    data: {

    },
    methods: {
        switcher: (e) => {
            document.querySelector("#header .active").classList.remove('active')
            e.target.classList.add('active')
    
            document.querySelector('#input-area .hide').classList.remove('hide')
            document.getElementById(e.target.dataset.nottype).classList.add('hide')
        },
        sendLoginForm: () => {
            const loginForm = document.getElementById("loginForm");
            const username = loginForm.querySelector('[name="usernameToLogin"]').value;
            const password = loginForm.querySelector('[name="pwdToLogin"]').value;
    
            const data = {
                username,
                password
            }
    
            console.log(data)
    
            login(data)
        },
        sendRegisterForm: () => {
    
            const data = {
                username,
                email,
                password,
                confirm_password
            }
    
            register(data)
        }
    },
    template: `
        <div id="input-area"  class="card">
            <div id="header">
                <div id="login-btn" class="active" data-nottype="registerForm">登录</div>
                <div id="register-btn" data-nottype="loginForm">注册</div>
            </div>
            <div class="hr"></div>
            <form id="loginForm">
                <div class="coolinput">
                    <label for="usernameToLogin" class="text">Name:</label>
                    <input type="text" placeholder="Your Name..." name="usernameToLogin">
                </div>
                <div class="coolinput">
                    <label for="pwdToLogin" class="text">Password:</label>
                    <input type="password" placeholder="Your Password..." name="pwdToLogin">
                </div>
                <div id="loginSubmit" class="button">登录</div>
            </form>
            <form id="registerForm" class="hide">
                <div class="coolinput">
                    <label for="usernameToRegister" class="text">Name:</label>
                    <input type="text" placeholder="Your Name..." name="usernameToRegister">
                </div>
                <div class="coolinput">
                    <label for="email" class="text">Email:</label>
                    <input type="text" placeholder="Your Email..." name="email">
                </div>
                <div class="coolinput">
                    <label for="pwdToRegister" class="text">Password:</label>
                    <input type="password" placeholder="Your Password..." name="pwdToRegister">
                </div>
                <div class="coolinput">
                    <label for="pwdToConfirm" class="text">Confirmed Password:</label>
                    <input type="password" placeholder="Your Confirmed Password..." name="pwdToConfirm">
                </div>
                <div id="registerSubmit"  class="button">注册</div>
            </form>
        </div>
    `,
    beforeMount: function() {
        return this.template
    },
    afterMount: function() {
        document.getElementById('header').addEventListener('click', this.methods.switcher)
        document.getElementById('loginSubmit').addEventListener('click', this.methods.sendLoginForm)
        document.getElementById('registerSubmit').addEventListener('click', this.methods.sendRegisterForm)
    },
    destroyed: function() {
        document.getElementById('header').removeEventListener('click', this.methods.switcher)
        document.getElementById('loginSubmit').removeEventListener('click', this.methods.sendLoginForm)
        document.getElementById('registerSubmit').removeEventListener('click', this.methods.sendRegisterForm)
    }
}