const {createClient} = require("redis"); 

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST_ID,
        port: 11324
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
module.exports = redisClient;