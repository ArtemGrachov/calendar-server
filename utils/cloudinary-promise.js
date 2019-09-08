const cloudinary = require('cloudinary').v2;

exports.upload = function(file) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file, (error, result) => {
            if (error) {
                reject(error);
            }
            resolve(result);
        })
    })
}

exports.delete = function(filePublicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(filePublicId, {}, (error, result) => {
            if (error) {
                reject(error);
            }
            resolve(result);
        })
    })
}