// dependencies
const router = require('express').Router();

// core modules
const CategoryController = require('../../core/classes/category/category-controller');

const Action = require('../../core/classes/utils/action');
const Method = require('../../core/classes/utils/method');

const {getParamsOnRequest} = require("../../core/utils/helper.utils");
const handleGetMethod = require('./GET');
const handlePostMethod = require('./POST');

/**
 * Middleware for registering variables
 * */
router.all('*', (req, res, next) => {
    // params, default point to the dashboard page
    const [type] = getParamsOnRequest(req, ['default']);

    // queries
    const action = req.query.action;
    const method = req.query.method;
    const getJSON = req.query.getJSON;

    // categories
    res.locals.categories = CategoryController.instances;
    res.locals.categoryItem = CategoryController.getCategoryItem(type);
    res.locals.action = Action.getActionType(action);
    res.locals.method = Method.getValidatedMethod(method);
    res.locals.getJSON = getJSON;
    res.locals.params = {type};

    next();
});


/**
 * Dynamic page with file type
 * */
router.all('*', (request, response, next) => {
    const method = response.locals.method;

    switch(method.name){
        case 'get':{
            handleGetMethod(request, response, next);
            break;
        }
        case 'post':{
            handlePostMethod(request, response, next);
        }
    }
});

module.exports = router;