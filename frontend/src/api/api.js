import requests from '../utils/requests.js'

// 加载动画组件
const loader = document.querySelector('.box')

// 状态异常处理
export function errHandler(err, out = false) {
    if (err?.status === 429){
        window.alert('请求过于频繁！请求被冻结~')
    }
    else if (err?.status === 500){
        window.alert('服务器出错！请网站维修后再访问~')
    }
    else {
        window.alert(err?.message?.detail || '本地状态出错！请重新登录~')
    }
    if (out){
        // 登出
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        document.body.classList.remove('logined')
        sessionStorage.removeItem('zctf-status')
        // 跳转到登录界面
        window.location.hash = '#/login'
    }
}

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
        sessionStorage.setItem('zctf-userinfo', JSON.stringify(res.message))
        document.querySelector('#userinfo>span').innerText = res.message.username
        flag = true
    })
    .catch(err => {
        // 报错，重新登录
        errHandler(err, true)
    })
    return flag
}

// 获取邮箱激活码
export async function getEmailVerification(purpose = 'registration') {
    // 失败返回flag 为true
    let flag = false
    const configToGetVerification = {
        method: 'POST',
        url: '/auth/email-verify/',
        data: {
            purpose
        },
        token: localStorage.getItem('zctf-access'),
    }
    await requests(configToGetVerification, loader)
    .then(res => {
        //die silently
    })
    .catch(err => {
        // 激活码未过期
        errHandler(err)
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
        errHandler(err, true)
    })
    return flag
}

// token验证
export async function verify() {
    if (sessionStorage.getItem('zctf-status') === '1'){
        return true
    }
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
        // die silently
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
            localStorage.setItem('zctf-access', res.message.access)
            flag = true
        })
        .catch(err => {
            //die silently (flag = false)
        })
    }
    // 验证失败
    if (!flag){
        localStorage.removeItem('zctf-access')
        localStorage.removeItem('zctf-refresh')
        document.body.classList.remove('logined')
        sessionStorage.removeItem('zctf-status')
    }
    else {
        sessionStorage.setItem('zctf-status', '1')
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
        localStorage.setItem('zctf-access', res.message.access)
        localStorage.setItem('zctf-refresh', res.message.refresh)
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
                // 登出
                localStorage.removeItem('zctf-access')
                localStorage.removeItem('zctf-refresh')
                document.body.classList.remove('logined')
                sessionStorage.removeItem('zctf-status')
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
                const err = {
                    message: {
                        detail: '激活失败！'
                    }
                }
                errHandler(err, true)
                return
            }
        }
    }
    // 老用户登录&&新用户激活成功，则flag为true,切换为登录成功视图
    if (flag){
        window.alert('登录成功！')
        document.body.classList.add('logined')
        sessionStorage.setItem('zctf-status', '1')
        window.location.hash = '#/home'
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
        if ('username' in err.message){
            usernameAlert.innerHTML = '*用户名已存在！'
        }
        else {
            usernameAlert.innerHTML = ''
        }
        if ('email' in err.message){
            emailAlert.innerHTML = '*该邮箱已被注册！'
        }
        else {
            emailAlert.innerHTML = ''
        }
        if ('password' in err.message){
            pwdToRegisterAlert.innerHTML = '*密码过于简单！'
        }
        else {
            pwdToRegisterAlert.innerHTML = ''
        }
        if ('confirm_password' in err.message){
            pwdToConfirmAlert.innerHTML = '*两次密码不相同！'
        }
        else {
            pwdToConfirmAlert.innerHTML = ''
        }
    })
}

// 获取题目列表（含详情）
export async function getChallengeList(page, type = 'All') {
    let challenges = {}
    const configToGetChallenges = {
        method: 'GET',
        url: '/api/challenges/',
        params: {
            // 页码
            page,
        },
        token: localStorage.getItem('zctf-access'),
    }
    // 添加type属性 misc/web/pwn...
    if (type !== 'All'){
        configToGetChallenges.params.type = type
    }
    await requests(configToGetChallenges, loader)
    .then(res => {
        // 返回题目信息
        challenges = res.message
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
        result = res.message
    })
    // 数据获取失败
    .catch(err => {
        if(err.message.detail === 'You have created a session for this challenge!'){
            result = {
                status: '1'
            }
        }
        else {
            result = {
                status: '2',
                detail: err.message.detail,
            }
        }
    })
    return result
}

// 附件下载
export function downloadFile() {
    const id = document.querySelector('.overlay').dataset.id
    const configToDownloadFile = {
        method: 'GET',
        url: `/api/challenge-file-download/${id}/`,
        token: localStorage.getItem('zctf-access'),
        has_file: true
    }
    requests(configToDownloadFile)
    .then(res => {
        // 生成临时链接
        const downloadUrl = URL.createObjectURL(res.message)

        // 创建一个隐藏的<a>标签
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'challenge.zip'

        // 模拟点击下载
        document.body.appendChild(a)
        a.click()
        a.remove()

        // 清理临时链接
        URL.revokeObjectURL(downloadUrl)
    })
    .catch(err => {
        errHandler(err)
    })
}

// 销毁题目会话
export async function deleteChallengeSession() {
    let response = null
    const configToDeleteSession = {
        method: 'DELETE',
        url: '/api/challenge-session/',
        token: localStorage.getItem('zctf-access'),
        // 让Content-Type为application/json
        data: {}
    }
    await requests(configToDeleteSession, loader)
    .then(res => {
        // 成功
        response = {
            status: true,
        }
    })
    .catch(err => {
        // 失败
        response = {
            status: false,
            detail: err.message.detail
        }
    })
    return response
}

// flag提交
export async function submitFlag(flag) {
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
        window.alert('flag正确！')
        // 刷新页面
        location.reload()
    })
    .catch(err => {
        window.alert(err.message.detail)
    })
}

// 用户排名
export async function getUserRanking(page = 1) {
    let results = null
    const configToGetUserRanking = {
        method: 'GET',
        url: '/api/user-scores/',
        params: {
            page
        },
        token: localStorage.getItem('zctf-access')
    }
    await requests(configToGetUserRanking, loader)
    .then(res => {
        results = res.message
    })
    .catch(err => {
        if (err.message?.detail === 'Invalid page.'){
            window.alert(err.message.detail)
        }
        else {
            errHandler(err)
        }
    })
    return results
}

// 战队排名
export async function getTeamRanking(page = 1) {
    let results = null
    const configToGetTeamRanking = {
        method: 'GET',
        url: '/api/team-scores/',
        params: {
            // 页码
            page
        },
        token: localStorage.getItem('zctf-access')
    }
    await requests(configToGetTeamRanking, loader)
    .then(res => {
        results = res.message
    })
    .catch(err => {
        if (err.message?.detail === 'Invalid page.'){
            window.alert(err.message.detail)
        }
        else {
            errHandler(err)
        }
    })
    return results
} 

export async function resetUsername(username) {
    let flag = false
    const configToReviseName = {
        method: 'PATCH',
        url: `/api/users/update-username/${JSON.parse(sessionStorage.getItem('zctf-userinfo')).id}/`,
        token: localStorage.getItem('zctf-access'),
        data : {
            username
        }
    }
    await requests(configToReviseName, loader)
    .then(res => {
        window.alert('修改成功！')
        const userinfo = JSON.parse(sessionStorage.getItem('zctf-userinfo'))
        userinfo.username = res.message.username
        sessionStorage.setItem('zctf-userinfo', JSON.stringify(userinfo))
        flag = true
    })
    .catch(err => {
        if ('username' in err.message){
            window.alert(err.message.username)
        }
        else {
            errHandler(err)
        }
    })
    return flag
}

export async function resetPwd(data) {
    let flag = false
    const configToResetPwd = {
        method: 'POST',
        url: '/auth/password-reset/',
        data,
        token: localStorage.getItem('zctf-access')
    }
    await requests(configToResetPwd, loader)
    .then(res => {
        window.alert(res.message.detail)
        flag = true
    })
    .catch(err => {
        if ('non_field_errors' in err.message){
            window.alert(err.message.non_field_errors)
        }
        if ('detail' in err.message){
            window.alert(err.message.detail)
        }
    })
    return flag
}