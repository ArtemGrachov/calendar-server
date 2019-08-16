module.exports = {
    jwtKey: process.env.JWT_KEY || 'secretjwtkey',
    db: `mongodb://${process.env.DB || 'localhost:27017/calendar'}`
}
