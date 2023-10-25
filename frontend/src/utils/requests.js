export default function requests(req, preloader = null){
    const BaseURL = "http://127.0.0.1:8000"
    return new Promise((resolve,reject)=>{
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
                if (preloader !== null){
                    preloader.style.display = 'none'
                }
                if(xhr.status>=200 && xhr.status<300){
                    resolve(JSON.parse(xhr.response))
                }
                else{
                    reject(new Error(xhr.response))
                }
            }
        })
        if(req.data){
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
            xhr.send(JSON.stringify(req.data))
        }else{
            xhr.send()
        }
    })
}