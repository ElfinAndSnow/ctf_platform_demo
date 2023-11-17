import requests from '../utils/requests.js'

// 加载动画组件
const loader = document.querySelector('.box')

// 获取用户个人信息
export async function getUserInfo() {
    let flag = false
    // configure message
    const configToGetUserInfo = {
        method: 'GET',
        url: '/api/UserInfoPublicView',
        token: localStorage.getItem('zctf-access'),
    }
    await requests(configToGetUserInfo, loader)
    .then(res => {
        // 用户个人信息存入sessionStorage
        sessionStorage.setItem('zctf-userinfo', JSON.stringify(res))
        flag = true
    })
    .catch(err => {
        // 报错，重新登录
        window.alert('本地状态获取错误，请重新登录')
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        location.hash = '#/login'
    })
    return flag
}

// 获取邮箱激活码
async function getEmailVerification() {
    // 失败返回flag 为true
    let flag = false
    const configToGetVerification = {
        method: 'POST',
        url: '/auth/email-verify/',
        data: {
            purpose: 'registration'
        },
        token: localStorage.getItem('zctf-access'),
    }
    await requests(configToGetVerification, loader)
    .then(res => {
        //die silently
    })
    .catch(err => {
        // 激活码未过期
        if (err.detail[0] === 'Please wait for your last verification code expires.'){
            window.alert('请稍后再重新登录以获取新激活码！')
        }
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        document.body.classList.remove('logined')
        flag = true
    })
    // 放回成功标志位
    return flag
}

// 激活账号
async function accountActivate(data){
    // 失败返回flag 为false
    let flag = false
    const configToGetActivated = {
        method: 'POST',
        url: '/auth/account-activate/',
        token: localStorage.getItem('zctf-access'),
        data
    }
    await requests(configToGetActivated)
    .then(res => {
        // 激活成功
        window.alert('账号激活成功！')
        flag = true
    })
    .catch(err => {
        // 激活失败
        window.alert('激活失败！请重新登录以输入激活码')
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        document.body.classList.remove('logined')
    })
    return flag
}

// token验证
export async function verify() {
    if (localStorage.getItem('zctf-access') === null){
        return false
    }
    
    // access 验证
    let configToVerify = {
        method: 'POST',
        url: '/auth/token/verify/',
        data: {
            token: localStorage.getItem('zctf-access'),
        }
    }
    let flag = false
    await requests(configToVerify, loader)
    .then(res => {
        flag = true
    })
    .catch(err => {
        //die silently
    })
    if (!flag){
        // refresh access
        configToVerify = {
            method: 'POST',
            url: '/auth/token/refresh/',
            data: {
                refresh: localStorage.getItem('zctf-refresh'),
            }
        }
        await requests(configToVerify, loader)
        .then(res => {
            localStorage.setItem('zctf-access', res.access)
            flag = true
        })
        .catch(err => {
            //die silently (flag = false)
        })
    }

    // 验证失败
    if (!flag){
        // 删除本地token
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        // 未登录视图
        document.body.classList.remove('logined')
    }
    return flag

}

// 登录请求
export async function login(data, alert = null) {
    let flag = false
    // 登录认证
    const config = {
        method: 'POST',
        url: '/auth/token/',
        data
    }
    await requests(config, loader)
    .then(res => {
        // token存入localStorage
        localStorage.setItem('zctf-access', res.access)
        localStorage.setItem('zctf-refresh', res.refresh)
        flag = true
    })
    .catch(err => {
        // 登入失败返回提示
        window.alert('用户不存在或密码错误')
        if (alert !== null){
            alert.innerHTML = '*用户不存在或密码错误'
        }
    })

    // 若登录成功，判断是否激活
    if (flag){
        // 获取用户信息
        flag = await getUserInfo()
        // 判断用户是否激活
        if(flag&&!JSON.parse(sessionStorage.getItem('zctf-userinfo')).is_email_verified){
            // 未激活，获取邮箱激活码
            flag = await getEmailVerification()

            // 获取激活码失败，重新登录
            if (flag){
                return
            }

            // 获取激活码成功，则获取用户输入的激活码并验证
            const activateCode = String(prompt('新用户需激活账号\n我们已向您的邮箱发送了激活码，请填入'))
            // 若用户未放弃激活，验证用户输入的激活码
            if (activateCode !== 'null'){
                flag = await accountActivate({
                    verify_code: activateCode,
                    verify_purpose: 'registration',
                })
            }
            // 用户放弃激活，则重新登录
            else {
                window.alert('激活失败！')
                location.hash = '#/login'
                // 删除登录获取的token，并跳出登录认证
                localStorage.removeItem('zctf-access')
                localStorage.removeItem('zctf-refresh')
                return
            }
        }
    }
    // 老用户登录&&新用户激活成功，则flag为true,切换为登录成功视图
    if (flag){
        window.alert('登录成功！')
        document.body.classList.add('logined')
        window.history.back(-1)
    }
}

// 注册请求
export function register(data, loginbar, usernameAlert, emailAlert, pwdToRegisterAlert, pwdToConfirmAlert) {
    const config = {
        method: 'POST',
        url: '/auth/register/',
        data
    }
    requests(config, loader)
    .then(res => {
        window.alert('注册成功！')
        // 清除提示
        usernameAlert.innerHTML = ''
        emailAlert.innerHTML = ''
        pwdToRegisterAlert.innerHTML = ''
        pwdToConfirmAlert.innerHTML = ''
        // 切换为登录视图
        if (document.getElementById(loginbar) !== null){
            document.getElementById(loginbar).click()
        }
    })
    .catch(err => {
        // 失败提示
        window.alert('注册失败！')
        if ('username' in err){
            usernameAlert.innerHTML = '*用户名已存在！'
        }
        else {
            usernameAlert.innerHTML = ''
        }
        if ('email' in err){
            emailAlert.innerHTML = '*该邮箱已被注册！'
        }
        else {
            emailAlert.innerHTML = ''
        }
        if ('password' in err){
            pwdToRegisterAlert.innerHTML = '*密码过于简单！'
        }
        else {
            pwdToRegisterAlert.innerHTML = ''
        }
        if ('confirm_password' in err){
            pwdToConfirmAlert.innerHTML = '*两次密码不相同！'
        }
        else {
            pwdToConfirmAlert.innerHTML = ''
        }
    })
}

// 获取题目列表（含详情）
export async function getChallengeList(page) {
    let challenges = {}
    const configToGetChallenges = {
        method: 'GET',
        url: '/api/challenges/',
        params: {
            // 页码
            page
        },
        token: localStorage.getItem('zctf-access'),
    }
    await requests(configToGetChallenges, loader)
    .then(res => {
        challenges = res.results
    })
    .catch(err => {
        window.alert('服务端错误，获取题目列表失败！')
        window.history.back(-1)
    })

    // 返回题目列表
    return challenges
}

// 创建题目会话
export async function createChallengeSession(id) {
    let result = undefined
    const configToGetDetail = {
        method: 'POST',
        url: '/api/challenge-session/',
        token: localStorage.getItem('zctf-access'),
        data: {
            // 题目id
            challenge: id
        }
    }
    await requests(configToGetDetail, loader)
    .then(res => {
        // 返回result
        result = res
    })
    // 数据获取失败
    .catch(err => {
        if(err.detail === 'You have created a session for this challenge!'){
            result = {
                status: true
            }
        }
    })
    return result
}

// 销毁题目会话
export async function deleteChallengeSession() {
    const configToDeleteSession = {
        method: 'DELETE',
        url: '/api/challenge-session/',
        token: localStorage.getItem('zctf-access'),
        // 让Content-Type为application/json
        data: {}
    }
    await requests(configToDeleteSession, loader)
    .then(res => {
        // die silently
    })
    .catch(err => {
        // die silently
    })
}

// flag提交
export async function submitFlag(flag) {
    // 提交结果
    let result = false
    const configToSubmitFlag = {
        method: 'POST',
        url: '/api/flag-submission',
        token: localStorage.getItem('zctf-access'),
        data: {
            // flag
            user_flag: flag
        }
    }
    await requests(configToSubmitFlag, loader)
    .then(res => {
        result = true
    })
    .catch(err => {

    })

    if (result){
        // 更新用户信息
        await getUserInfo()
    }

    return result
}

// 战队排名
export async function getTeamRanking(page) {
    const configToGetTeamRanking = {
        method: 'GET',
        url: '/api/leaderboard/teams/',
        params: {
            // 页码
            page
        },
        token: localStorage.getItem('zctf-access')
    }
    await requests(configToGetTeamRanking)
    .then(res => {
        // 保存数据
        sessionStorage.setItem('zctf-team-rank', JSON.stringify(res))
    })
    .catch(err => {
        // 数据获取失败
        sessionStorage.setItem('zctf-team-rank',  '0')
    })
} 