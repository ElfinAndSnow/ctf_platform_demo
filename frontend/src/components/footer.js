import '../assets/css/footer.css'
export default function initFooter(){
    const content = `
    <div>© 2023 by</div> <div> ElfinAndSnow | OrlandoFurioso | Fanglinrui | DopamineNone</div>
    <div>Repos: <a href="https://github.com/ElfinAndSnow/ctf_platform_demo">https://github.com/ElfinAndSnow/ctf_platform_demo</a></div>
    `
    const footer = document.createElement('footer')
    footer.innerHTML = content
    document.body.appendChild(footer)


}