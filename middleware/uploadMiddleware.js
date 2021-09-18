const multer=require('multer')
// const upload=multer({storage: multer.memoryStorage()})

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        cb(null, 'emotion.png')
    }
  });

var upload = multer({ storage: storage });

module.exports = {upload}