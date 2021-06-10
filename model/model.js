var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true

    },
    name: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    },
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }]

}, {
    timestamps: true
});



const videoSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    discription: {
        type: String,
    },
    video: {
        type: String,
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

}, {
    timestamps: true
});

const Video = mongoose.model('Video', videoSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    Video
};