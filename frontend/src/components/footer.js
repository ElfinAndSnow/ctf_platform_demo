import '../assets/css/footer.css'
/*
页脚内容
1. 项目贡献者
2. 项目仓库地址
*/
export default {
    target: 'footer',
    data: undefined,
    methods: undefined,
    template: `<div>© 2023 by</div> <div> ElfinAndSnow | OrlandoFurioso | Fanglinrui | DopamineNone</div>
    <div>Repos: <a href="https://github.com/ElfinAndSnow/ctf_platform_demo">https://github.com/ElfinAndSnow/ctf_platform_demo</a></div>`,
    beforeMount: function() {
        return this.template
    },
    afterMount: undefined,
    destoryed: undefined,
}