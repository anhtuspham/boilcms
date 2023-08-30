const mongoose = require('mongoose')
const Schema =mongoose.Schema;

const Post = new Schema({
    title:{
        type: String
    },
    status:{
        type: String
    },
    visibility:{
        type: String
    },
    publish: {
        type: Date
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    url:{
        type: String
    }
})

module.exports = mongoose.model('post',Post)
