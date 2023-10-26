import '../assets/css/loader.css'
export function preload(){
    document.body.dataset.theme = localStorage.getItem('zctf-darkmode')

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