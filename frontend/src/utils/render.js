export default function render(component) {
    // 获取挂载节点
    const target = document.querySelector(component.target)
    // 挂载前处理（令牌验证、数据请求等）
    target.innerHTML = component.beforeMount()
    // 挂载后处理 （绑定事件等）
    if (typeof component.afterMount !== 'undefined'){
        component.afterMount()
    }
    // 返回组件，便于销毁事件等（component.destoryed)
    return component
}

/*  组件结构
component = {
    target: 'header',
    data: {
        //data
        hasLoadedStyle: false,
        hasLogined: false,
    },
    methods: {
        //methods added to listener(may be destoryed)
        ...
    },
    template: `
        ...
    `,
    beforeMount: function() {
        //Get info by ajax
        ...

        //Render template
        ...
        
        return this.template
    },
    afterMount: function() {
        //Load images
        ...

        //Add event listener
        ...
    },
    destroyed: function() {
        //Remove object and event listener when component is destoryed
        ...
    },
*/