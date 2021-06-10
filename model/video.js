var mongoose = require('mongoose');


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
    user: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

}, {
    timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;