const {readFileAsync} = require('../../utils/os.utils');
const {CORE_DIRECTORY} = require('../../utils/config.utils');

const path = require('path');
const ejs = require('ejs');

class Content{

    /**
     * Get content by post_type
     * @param type {string}
     * @param actionType {Object}
     * @param data {Object}
     * @return {Promise}
     * */
    getContentByType(type, actionType, data = {}){
        let htmlContent = '';

        return new Promise((resolve) => {
            const directory = path.join(CORE_DIRECTORY, 'views', 'custom-type', type, actionType.fileName + '.ejs');

            this.getHTML(directory, data)
                .then(response => {
                    htmlContent = response;
                })
                .catch(err => {
                    console.error(err);
                })
                .finally(() => {
                    resolve(htmlContent);
                });
        });
    }

    /**
     * Get HTML based on post_type and the data from input
     * @param directory {string}
     * @param data {Object}
     * @return {Promise}
     * */
    getHTML(directory, data){
        return new Promise((resolve, reject) => {
            readFileAsync(directory)
                .then(file => resolve(ejs.render(file, data)))
                .catch(err => reject(err));
        });
    }

    getRenderHTML(property){
        const ComponentController = require('../component/component-controller');

        const component = {
            name: property.name,
            params: property.params || [],
            children: property.children
        };

        const componentInstance = ComponentController.getComponentBasedOnName(component.name);
        const renderedHTML = componentInstance.render(component);

        // render children HTML
        const childrenHTML = component.children
            .map(child => this.getRenderHTML.call(this, child))
            .join('');

        return renderedHTML.replaceAll('#{DATA_CHILDREN}', childrenHTML);
    }
}

module.exports = new Content();