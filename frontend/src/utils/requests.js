export default function requests(config, preloader = null){
    // 设置API的基地址
    const BaseURL = "http://49.232.236.235:80"
    return new Promise((resolve,reject)=>{
        // 创建xmlhttp请求对象
        const xhr = new XMLHttpRequest()
        // url拼接GET请求的参数
        if (typeof config?.params !== 'undefined'){
            const params = new URLSearchParams(config.params)
            const qString = params.toString()
            config.url = config.url + '?' + qString
        }

        // 确定请求的方式和接口地址
        xhr.open(config.method||"GET", BaseURL+config.url)

        // 处理请求结果
        xhr.addEventListener('readystatechange', ()=>{
            if (xhr.readyState === xhr.OPENED) {
                // 加载动画启动
                if (preloader !== null){
                    preloader.style.display = 'block'
                }
            }
            else if (xhr.readyState === xhr.DONE) {
                // 加载动画结束
                if (preloader !== null){
                    preloader.style.display = 'none'
                }
                // 正常请求结果处理
                if(xhr.status>=200 && xhr.status<300){
                    resolve(JSON.parse(xhr.response))
                }
                // 异常请求结果处理
                else{
                    reject(new Error(xhr.response))
                }
            }
        })

        // 请求头加上用户token
        if (typeof config?.token !== 'undefined'){
            xhr.setRequestHeader('Authorization', 'Bearer '+config.token)
        }

        // POST请求发送参数
        if(typeof config?.data !== 'undefined'){
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
            xhr.send(JSON.stringify(config.data))
        }

        // 非POST请求发送参数
        else{
            xhr.send()
        }
    })
}