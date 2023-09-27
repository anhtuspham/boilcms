class Component{
    constructor(information){
        this.name = information.name;
        this.params = information.params;
        this.isGroupComponent = this.name === 'row';
        this.component = this.createComponent();
    }

    createComponent(){
        const componentDiv = document.createElement('div');
        componentDiv.setAttribute('data-component', this.name);

        // add utils
        componentDiv.appendChild(this.createUtils());

        // add content
        componentDiv.appendChild(this.createContent(this.params));

        // add add-button
        if(this.isGroupComponent) componentDiv.appendChild(this.createAddComponents());

        return componentDiv;
    }

    createUtils(){
        const utilsDiv = document.createElement('div');
        utilsDiv.setAttribute('data-component-utils', '');

        // inner HTML
        utilsDiv.innerHTML = `
        <button type="button" data-toggle="component-panel" data-component-edit>Edit</button>
        <button type="button">Duplicate</button>
        <button type="button">Move</button>
        <button type="button" data-component-delete>Delete</button>
        `;

        return utilsDiv;
    }

    createAddComponents(){
        const addComponentDiv = document.createElement('div');
        addComponentDiv.setAttribute('data-component-add', '');

        // inner HTML
        addComponentDiv.innerHTML = `
        <button type="button" data-toggle="components">Add More</button>
        `;

        return addComponentDiv;
    }

    createContent(params){
        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('data-component-content', '');

        // group component
        if(this.isGroupComponent){
            contentDiv.setAttribute('data-component-children', '');
        }

        // inner HTML
        contentDiv.innerHTML = params.reduce((acc, cur) => {
            acc += `
<div data-param="${cur.key}">
    <span data-param-value="${cur.value}">${cur.value ?? ''}</span>
</div>`;
            return acc;
        }, '');

        return contentDiv;
    }
}

class PageBuilder{
    constructor(wrapper){
        // invalid element
        if(!wrapper) return;
        this.wrapper = wrapper;

        this.init();
    }

    init(){
        // register DOM elements
        this.parentGroup = null;
        this.componentDetailPanel = this.wrapper.querySelector('[data-pb-component-popup-content]');
        this.wrapperComponentEl = this.wrapper.querySelector('[data-component-wrapper]');
        this.jsonElement = this.wrapper.querySelector('[data-pb-json]');

        // render components based on JSON
        this.renderComponents();

        // register event listener
        this.wrapper.addEventListener('click', this.handleWrapperClick.bind(this));
    }

    renderComponents(){
        const jsonContent = this.jsonElement.textContent;
        if(!jsonContent) return;

        // get wrapper component
        const componentElement = this.generateObjectToDomElement(JSON.parse(jsonContent));

        // register data toggle
        Theme.toggleAttributeAction(componentElement.querySelectorAll('[data-toggle]'));

        // replace element
        this.wrapperComponentEl.replaceWith(componentElement);
        this.wrapperComponentEl = componentElement;
    }

    handleWrapperClick(e){
        // get the target
        let functionForHandling = () => {
        }, target = null;

        const addButtonEl = e.target.closest('[data-component-add]');
        const saveButtonEl = e.target.closest('[data-pb-component-popup-save]');
        const deleteButtonEl = e.target.closest('button[data-component-delete]');
        const editButtonEl = e.target.closest('button[data-component-edit]');
        const componentEl = e.target.closest('button[data-component]');

        // add component button
        if(addButtonEl){
            functionForHandling = this.handleAddComponentClick.bind(this);
            target = addButtonEl;
        }

        // save component
        else if(saveButtonEl){
            functionForHandling = this.handleSaveBtnClick.bind(this);
            target = saveButtonEl;
        }

        // add component from popup
        else if(componentEl){
            functionForHandling = this.handleComponentClick.bind(this);
            target = componentEl;
        }

        // edit component
        else if(editButtonEl){
            functionForHandling = this.handleEditComponentClick.bind(this);
            target = editButtonEl;
        }

        // delete component
        else if(deleteButtonEl){
            functionForHandling = this.handleDeleteComponentClick.bind(this);
            target = deleteButtonEl;
        }

        functionForHandling(target);
    }

    handleAddComponentClick(target){
        // re-assign parent group
        this.parentGroup = target.closest('[data-component]');
    }

    handleEditComponentClick(target){
        console.log('edit');
    }

    handleSaveBtnClick(target){
        // component information
        const componentInformation = {
            name: this.componentDetailPanel.dataset.component,
            params: []
        };

        // get params
        Array.from(this.componentDetailPanel.children).forEach(el => {
            const obj = {};
            obj.key = el.dataset.param;
            obj.value = el.querySelector('[data-param-value]').textContent;
            componentInformation.params.push(obj);
        });

        const componentInstance = new Component(componentInformation);
        const componentDomEl = componentInstance.component;

        // toggle attribute
        Theme.toggleAttributeAction(componentDomEl.querySelectorAll('[data-toggle]'));

        // insert to the group
        this.parentGroup.querySelector('[data-component-content]').insertAdjacentElement('beforeend', componentDomEl);

        // create JSON
        this.createJSON();
    }

    handleDeleteComponentClick(target){
        const componentEl = target.closest('[data-component]');
        componentEl.remove();

        // re-generate JSON
        this.createJSON();
    }

    createJSON(){
        this.jsonElement.value = JSON.stringify(this.generateDomElementToObject(this.wrapperComponentEl));
    }

    handleComponentClick(target){
        const componentName = target.dataset.component;

        this.getComponentInfoFromServer(componentName)
            .then(result => {
                this.componentDetailPanel.innerHTML = result.data;
                this.componentDetailPanel.dataset.component = result.component.name;

                if(this.isGroupComponent(componentName)) this.handleSaveBtnClick(target);
            });
    }

    getComponentInfoFromServer(componentName){
        return new Promise((resolve, reject) => {
            const urlObject = new URL(location.href);
            const url = urlObject.origin + urlObject.pathname;

            fetch(url + '?' + new URLSearchParams({
                method: 'get',
                action: 'get',
                getJSON: true,
                componentName
            }))
                .then(res => res.json())
                .then(result => resolve(result))
                .catch(err => reject(err));
        });
    }

    isGroupComponent(componentName){
        return componentName === 'row';
    }

    generateDomElementToObject(domElement){
        const contentElm = domElement.querySelector('[data-component-children]');
        const componentName = domElement.dataset.component;

        let returnObj = {
            name: componentName,
            children: []
        };

        // not have children => component with the data provided
        if(!contentElm){
            const elm = domElement.querySelector('[data-component-content]');
            returnObj.params = [];

            [...elm.children].forEach(param => {
                const object = {
                    key: param.dataset.param,
                    value: param.querySelector('[data-param-value]').dataset.paramValue,
                };
                returnObj.params.push(object);
            });

            return returnObj;
        }

        [...contentElm.children].forEach(el => {
            returnObj.children.push(this.generateDomElementToObject.call(this, el));
        });
        return returnObj;
    }

    generateObjectToDomElement(property){
        const componentInformation = {
            name: property.name,
            params: property.params || [],
            children: property.children
        };

        const component = new Component(componentInformation);

        const componentElement = component.component;
        const componentContentElement = componentElement.querySelector('[data-component-content]');

        // loop to get children elements
        componentInformation.children
            .map(child => this.generateObjectToDomElement.call(this, child))
            .forEach(dom => componentContentElement.appendChild(dom));

        return componentElement;
    }
}

document.querySelectorAll('[data-pb]').forEach(e => {
    window.instance = new PageBuilder(e);
});