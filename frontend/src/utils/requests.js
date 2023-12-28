export default function requests(config, loader = null){
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

        // 用Blob对象处理文件下载
        if (config.has_file){
            xhr.responseType = 'blob'
        }

        // 处理请求结果
        xhr.addEventListener('readystatechange', ()=>{
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // 关闭加载动画
                if (loader !== null){
                    loader.style.display = 'none'
                }
                // 正常请求结果处理
                if(xhr.status>=200 && xhr.status<300){
                    if (config.has_file){
                        resolve({
                            status: xhr.status,
                            message: xhr.response
                        })
                    }
                    else {
                        resolve({
                            status: xhr.status,
                            message: JSON.parse(xhr.response)
                        })
                    }
                }
                // 异常请求结果处理
                else{
                    reject({
                        status: xhr.status,
                        message: JSON.parse(xhr.response)
                    })
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

        // 启动加载动画
        if (loader !== null){
            loader.style.display = 'block'
        }
    })
}