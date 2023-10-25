export default function render(component) {
    const target = document.querySelector(component.target)
    target.innerHTML = component.beforeMount()
    if (typeof component.afterMount !== 'undefined'){
        component.afterMount()
    }
    return component
}

/*
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