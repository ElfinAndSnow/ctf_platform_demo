import '../assets/css/loader.css'
import { verify, getUserInfo } from '../api/api.js'
// 预加载器
export async function preload(){
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