const multer = require('multer');
const errors = require('../configs/errors');
const errorFactory = require('../utils/error-factory');
const config = require('../configs/main');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    }
});

exports.imageFilter = (req, file, cb) => {
    const types = config.allowedImageTypes.map(
        type => `image/${type}`
    );

    if (types.indexOf(file.mimetype) !== -1) {
        cb(null, true);
    } else {
        cb(
            errorFactory(
                422,
                errors.ONLY_IMAGES_ALLOWED,
                config
                .allowedImageTypes
            )
        );
    }
};

exports.imageUpload = multer({
    storage,
    fileFilter: this.imageFilter,
    limits: {
        fileSize: 100 * 1024
    }
});

exports.errorHandler = err => {
    if (err) {
        err.statusCode = 422;
        next(err);
    }
    next();
};