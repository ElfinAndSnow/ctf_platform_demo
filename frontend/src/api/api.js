import requests from '../utils/requests.js'

export async function verify() {
    if (localStorage.getItem('zctf-token') === null){
        console.log('exit!')
        return false
    }
    let config = {
        method: 'POST',
        url: '/auth/token/verify/',
        data: {
            token: JSON.parse(localStorage.getItem('zctf-token'))?.access,
        }
    }
    let flag = false
    await requests(config)
    .then(res => {
        console.log('access is available')
        flag = true
    })
    .catch(err => {
    })
    if (!flag){
        config = {
            method: 'POST',
            url: '/auth/token/refresh/',
            data: {
                refresh: JSON.parse(localStorage.getItem('zctf-token'))?.refresh,
            }
        }
        await requests(config)
        .then(res => {
            console.log('refresh is available')
            let token = JSON.parse(localStorage.getItem('zctf-token'))
            token.access = res.access
            localStorage.setItem('zctf-token', JSON.stringify(token))
            flag = true
        })
        .catch(err => {
        })
    }
    console.log('flag is' + flag)
    return flag

}

export function login(data, alert = null) {
    const config = {
        method: 'POST',
        url: '/auth/token/',
        data
    }
    requests(config)
    .then(res => {
        localStorage.setItem('zctf-token', JSON.stringify(res))
        document.body.classList.add('logined')
        window.history.back(-1)
    })
    .catch(err => {
        console.dir(alert)
        window.alert('用户不存在或密码错误')
        if (alert !== null){
            alert.innerHTML = '*用户不存在或密码错误'
        }
    })
}

export function register(data, usernameAlert, emailAlert, pwdToRegisterAlert, pwdToConfirmAlert) {
    const config = {
        method: 'POST',
        url: '/auth/register/',
        data
    }
    requests(config)
    .then(res => {
        console.log('register success!')
        window.alert('注册成功！')
    })
    .catch(err => {
        console.dir(err)
    })
}