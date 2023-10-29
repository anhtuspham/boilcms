import fetch from "@global/fetch";
const {modifyDate} = require('../../../../utils/helper.utils')

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
            genPassInput: wrapper.querySelector('[data-generate-password-input]')
        }

        // vars
        const urlObject = new URL(location.href);
        this.FETCH_URL = urlObject.origin + urlObject.pathname;

        // handle click action
        this.wrapper.addEventListener('click', this.handleWrapperClick.bind(this));
    }

    /**
     * Replace media item in popup
     * */
    replaceUser(data) {
        // set the id for the form
        this.elements.popupForm.dataset.id = data._id;

        // change the input of the form
        this.elements.userNameInput.value = data.name;
        this.elements.userEmailInput.value = data.email;
        this.elements.userRegisterInput.value = modifyDate(new Date(data.registerAt));
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

    /**
     * convert decimal to hex
     * */
    dec2hex(dec) {
        return dec.toString(16).padStart(2, "0")
    }

    handeGeneratePassword(target) {
        const formEl = target.closest('[data-user-form]');
        const id = formEl.getAttribute('data-id');

        const userEl = this.wrapper.querySelector(`[data-user-item][data-id="${id}"]`);
        console.log('userEl', userEl)

        const length = 20
        const arr = new Uint8Array(length / 2)

        window.crypto.getRandomValues(arr)
        console.log(this.elements.genPassInput.textContent)

        this.elements.genPassInput.textContent = Array.from(arr, this.dec2hex).join('')
    }

    handleWrapperClick(e) {
        let functionHandling = () => {
        };
        let target = null;

        const singleUserItemEl = e.target.closest('button[data-user-item]')
        const genPasswordBtnEl = e.target.closest('button[data-user-generate-password-btn]')

        if (singleUserItemEl) {
            functionHandling = this.showSingleUser.bind(this)
            target = singleUserItemEl
            console.log(singleUserItemEl)
        } else if (genPasswordBtnEl) {
            functionHandling = this.handeGeneratePassword.bind(this)
            target = genPasswordBtnEl
        }

        // call the function
        functionHandling(target);
    }
}