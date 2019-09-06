module.exports = {
    jwtKey: process.env.JWT_KEY || 'secretjwtkey',
    jwtRefreshKey: process.env.JWT_REFRESH_KEY || 'secretjwtrefreshkey',
    tokenLife: '1h',
    refreshTokenLige: '7d',
    db: `mongodb://${process.env.DB || 'localhost:27017/calendar'}`,
    allowedImageTypes: ['png', 'jpg', 'jpeg'],
    uploadImageSizeLimit: 100 * 1024
}
