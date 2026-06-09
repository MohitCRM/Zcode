const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'jNyJYAhQfwByvIiSBTz0K05WlJ87QBYp',
    socket: {
        host: 'sheer-merry-turbovivid-67141.db.redis.io',
        port: 14358
    }
});

module.exports = {redisClient};