import fetch from "@global/fetch";

export default class UserPost {
    constructor(wrapper) {
        this.wrapper = wrapper

        this.elements = {

            // popup
            popupForm: wrapper.querySelector('[data-user-form]'),

            // input fields
            userNameInput: wrapper.querySelector('[data-user-name]'),
            userEmailInput: wrapper.querySelector('[data-user-email]'),
            userRegisterInput: wrapper.querySelector('[data-user-register]'),

            // select fields
            selectRoleInput: wrapper.querySelector('[data-select-role-value]'),
            optionRoleInput: wrapper.querySelectorAll('[data-select-role-value] option'),
            selectStateInput: wrapper.querySelector('[data-select-state-value]'),
            optionStateInput: wrapper.querySelectorAll('[data-select-state-value] option'),

        }

        // vars
        const urlObject = new URL(location.href);
        this.FETCH_URL = urlObject.origin + urlObject.pathname;

        // handle click action
        this.wrapper.addEventListener('click', this.handleWrapperClick.bind(this));
    }

    // modify date publish
    modifyDate = (publishTime) => {
        const year = publishTime.getFullYear();
        const month = (publishTime.getMonth() + 1).toString().padStart(2, '0');
        const date = publishTime.getDate().toString().padStart(2, '0');
        const hour = publishTime.getHours().toString().padStart(2, '0');
        const minute = publishTime.getMinutes().toString().padStart(2, '0');
        return `${date}/${month}/${year} at ${hour}:${minute}`;
    };

    /**
     * Replace media item in popup
     * */
    replaceUser(data) {
        // set the id for the form
        this.elements.popupForm.dataset.id = data._id;

        // change the input of the form
        this.elements.userNameInput.value = data.name;
        this.elements.userEmailInput.value = data.email;
        this.elements.userRegisterInput.textContent = this.modifyDate(new Date(data.registerAt));
        this.elements.selectRoleInput.value = data.role

        this.elements.optionRoleInput.forEach(o => {
            if (o.getAttribute('value') === data.role) {
                o.setAttribute('selected', '')
            } else o.removeAttribute('selected')
        })

        this.elements.optionStateInput.forEach(o => {
            if (o.getAttribute('value') === data.state) {
                o.setAttribute('selected', '')
            } else o.removeAttribute('selected')
        })

    };

    showSingleUser(target) {
        const id = target.dataset.id;

        // get detail media
        // method: get, action on page edit to get detail page
        fetch(this.FETCH_URL, {
            method: 'get',
            action: 'edit',
            getJSON: true,
            id: id
        })
            .then(res => res.json())
            .then(result => {
                this.replaceUser(result.data)
            })

            // catch the error
            .catch(err => console.error(err))
    };

    handleSaveUser(target) {
        const formEl = target.closest('[data-user-form]');
        const id = formEl.getAttribute('data-id');

        const formData = new FormData();
        formData.append('name', this.elements.userNameInput.value);
        formData.append('email', this.elements.userEmailInput.value);
        formData.append('role', this.elements.selectRoleInput.value);
        formData.append('state', this.elements.selectStateInput.value)

        fetch(this.FETCH_URL, {
            method: 'post',
            action: 'edit',
            getJSON: true,
            id: id
        }, {
            method: 'post',
            body: formData
        })
            .then(res => res.json())
            .then((result) => {

                const mediaItemEl = this.wrapper.querySelector(`[data-user-item][data-id="${id}"] img`);
                if (!mediaItemEl) {
                    console.error('Can not find an image with id', id);
                    return;
                }

                // update the new media
                mediaItemEl.src = result.url.small;
                mediaItemEl.alt = result.name;

                // close the popup
                this.elements.closePopupForm.click();
            })
            .catch(err => console.error(err));
    }

    handleWrapperClick(e) {
        let functionHandling = () => {
        };
        let target = null;

        const singleUserItemEl = e.target.closest('button[data-user-item]')
        const saveUserBtnEl = e.target.closest('button[data-user-save-btn]')

        if (singleUserItemEl) {
            functionHandling = this.showSingleUser.bind(this)
            target = singleUserItemEl

        } else if (saveUserBtnEl) {
            functionHandling = this.handleSaveUser.bind(this);
            target = saveUserBtnEl
        }

        // call the function
        functionHandling(target);
    }
}