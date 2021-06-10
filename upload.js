const multer = require('multer');
const path = require('path');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
})

var upload = multer({
  storage: storage
}).single('video')

module.exports = upload;