const mongoose = require('mongoose');

const Media = new mongoose.Schema({
    // clarify each images and filtering
    name: {
        type: String,
        default: ''
    },
    // video, mp4, pdf,..
    type: {
        type: String,
        required: true
    },
    uploadTime: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    url:{
        type: String,
    }
});

module.exports = Media;