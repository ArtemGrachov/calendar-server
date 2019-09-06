const fs = require('fs');
const path = require('path');

module.exports = function(filePath) {
    try {
        const fullPath = path.join(__dirname, '../uploads', filePath);
        fs.unlink(fullPath, () => {});
    } catch (err) { }
}
