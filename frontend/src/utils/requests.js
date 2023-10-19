export default function requests(req, preloader = null){
    const BaseURL = ""
    return new Promise((resolve,reject)=>{
        const token = localStorage.getItem('token')
        if (!token){
            location.hash = '/Home'
            reject('请登陆或注册！')
        }
        const xhr = new XMLHttpRequest()
        if (req.params){
            const params = new URLSearchParams(req.params)
            const qString = params.toString()
            req.url = req.url + '?' + qString
        }
        xhr.open(req.method||"GET", BaseURL+req.url)
        xhr.addEventListener('readystatechange', ()=>{
            if (xhr.readyState === xhr.OPENED) {
                if (preloader !== null){
                    preloader.style.display = 'block'
                }
            }
            else if (xhr.readyState === xhr.DONE) {
                if(xhr.status>=200 && xhr.status<300){
                    resolve(JSON.parse(xhr.response))
                }
                else{
                    reject(new Error(xhr.response))
                }
            }
        })
        if(req.data){
            xhr.send(req.data)
        }else{
            xhr.send()
        }
    })
}