import requests from '../utils/requests.js'

export async function verify() {
    let req = {
        method: 'POST',
        url: '/auth/token/verify/',
        data: {
            token: JSON.parse(localStorage.getItem('zctf-token')).access,
        }
    }
    let flag = await requests(req)
    .then(res => {
        return true
    })
    .catch((err) => {
        return false
    })
    if (!flag){
        req = {
            method: 'POST',
            url: 'auth/token/fresh/',
            data: {
                token: JSON.parse(localStorage.getItem('zctf-token')).fresh,
            }
        }
        flag = await requests(req)
        .then(res => {
            return true
        })
        .catch(err => {
            return false
        })
        if (!flag){
            return false
        }
    }
    
    return true

}

export function login(data) {
    const req = {
        method: 'POST',
        url: '/auth/token/',
        data
    }
    requests(req)
    .then(res => {
        console.log(res)
        localStorage.setItem('zctf-token', JSON.stringify(res))
        window.history.back(-1)
    })
    .catch(err => console.dir(err))
}

export function register(data) {
    const req = {
        method: 'POST',
        url: '/auth/register/',
        data
    }
    requests(req).then().catch()
}