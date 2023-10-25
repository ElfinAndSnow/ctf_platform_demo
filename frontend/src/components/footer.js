import '../assets/css/footer.css'

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