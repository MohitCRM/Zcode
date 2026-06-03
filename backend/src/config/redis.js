const {createClient} = require('redis');

const redisClient = createClient({
    username : 'defualt',
    password : process.env.REDIS_PASS,
    socket : {
        host: 'sheer-merry-turbovivid-67141.db.redis.io',
        port: 14358 
    }
})

module.exports = {redisClient};