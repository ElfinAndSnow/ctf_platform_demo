export default function auth(){
    const info = JSON.parse(localStorage.getItem('zctf'))
    if(info?.userToken){
        
    }
    else if(info?.freshToken){

    }
    else {
        
    }
    return true
}