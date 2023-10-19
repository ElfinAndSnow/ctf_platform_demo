import '../assets/css/loader.css'
export function preload(){
    const info = JSON.parse(localStorage.getItem('zctf'))
    if (info?.darkMode){
        document.body.dataset.theme = info.darkMode
        console.log(info.darkMode)
    }
    document.onreadystatechange = () => {
        const loader = document.querySelector(".box")
        switch (document.readyState) {
            case 'complete': 
                loader.style.display = 'none'
            break
            case 'loading':
                loader.style.display = 'block'
        }
    }
}