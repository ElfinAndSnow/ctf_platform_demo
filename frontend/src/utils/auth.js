export default function auth(){
    if (!localStorage.getItem('token')){
        location.hash = '/home'
    }
}