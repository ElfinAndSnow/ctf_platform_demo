import '../assets/css/loader.css'
import { verify, getUserInfo } from '../api/api.js'
// 预加载器
export async function preload(){
    console.log('1')
    // 使用用户上次选择的深浅色模式
    document.body.dataset.theme = localStorage.getItem('zctf-darkmode')
    // 判断用户是否登录
    const isLogined = await verify()
    if (isLogined) {
        console.log('2')
        document.body.classList.add('logined')
        await getUserInfo()
    }


    // 载入加载动画
    document.onreadystatechange = () => {
        const loader = document.querySelector(".box")
        switch (document.readyState) {
            case 'loading': 
                loader.style.display = 'block'
            break
            case 'complete':
                loader.style.display = 'none'
        }
    }
}