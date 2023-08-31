// dependencies
const express = require('express');
const router = express.Router();

// core modules
const Category = require('../core/classes/category');
const Content = require("../core/classes/content");
const CategoryController = require('../core/classes/category-controller');
const {ADMIN_URL} = require("../core/utils/configs");
const Action = require('../core/classes/action');
const Type = require('../core/classes/type');

/**
 * Register categories
 * */
CategoryController.add(new Category({
    name: 'Dashboard',
    url: '/',
    type: 'default',
    contentType: Type.types.DEFAULT
}));
CategoryController.add(new Category({
    name: 'Post',
    url: '/posts',
    type: 'posts',
    contentType: Type.types.POSTS
}));
CategoryController.add(new Category({
    name: 'Pages',
    url: '/pages',
    type: 'pages',
    contentType: Type.types.POSTS
}));
CategoryController.add(new Category({
    name: 'Media',
    url: '/media',
    type: 'media',
    contentType: Type.types.MEDIA
}));

/**
 * Middleware for registering variables
 * */
router.get('*', (req, res, next) => {
    // categories
    res.locals.categories = CategoryController.categoryItems;

    next();
});

/**
 * Middleware for getting categoryItem and action
 * */
router.all('/:type', (req, res, next) => {
    // get the category item
    const categoryItem = CategoryController.getCategoryItem(req.params.type);

    // validate action type on the URL
    const actionType = req.query.action;
    const validatedAction = Action.getActionType(actionType);

    res.locals.categoryItem = categoryItem;
    res.locals.validatedAction = validatedAction;

    next();
});

/**
 * Dashboard page
 * */
router.get('/', (req, res) => {
    Content.getContentByType('default', Action.getActionType('get'), {})
        .then(html => {
            res.render('admin', {
                content: html,
            });
        });
});


/**
 * Dynamic page with file type
 * */
router.get('/:type', async(req, res) => {
    const categoryItem = res.locals.categoryItem;
    const action = res.locals.validatedAction;

    if(!categoryItem){
        return res.redirect('/' + ADMIN_URL);
    }

    let promise = Promise.resolve();
    switch(action.name){
        case 'get':{
            promise = categoryItem.getAllData();
            break;
        }
        case 'add':{
            break;
        }
        case 'edit':{
            const id = req.query.id;
            promise = categoryItem.getDataById(id);
            break;
        }
    }

    promise
        .then(result => {
            const data = {
                data: result,
                title: categoryItem.name,
                contentType: categoryItem.contentType.name,
                actionType: action.name
            };

            // render html to fe
            Content.getContentByType(categoryItem.contentType.name, action, data)
                .then(html => {
                    res.render('admin', {
                        content: html,
                    });
                });
        })
        .catch(err => {
            console.error(err);
        });
});

router.post('/:type', async(req, res) => {
    const categoryItem = res.locals.categoryItem;
    const action = res.locals.validatedAction;
    const requestData = req.body;

    let promise = Promise.resolve();

    console.log(action);
    switch(action.name){
        case 'get':{
            break;
        }
        case 'add':{
            promise = categoryItem.add(requestData);
            break;
        }
        case 'edit':{
            const id = req.query.id;
            console.log(req.body, id);
            promise = categoryItem.databaseModel.findOneAndUpdate({_id: id}, req.body);
        }
    }

    promise
        .then(result => {
            console.log(result);
            res.redirect(req.params.type);
        });
});

module.exports = router;