const config = require('../config/env');
const { getRedis } = require('../config/db');

async function set(key, value, expiration = 3600) {
    const redisClient = getRedis();
    await redisClient.setEx(key, expiration, value);
}

async function get(key) {
    const redisClient = getRedis();
    return redisClient.get(key);
}

async function del(key) {
    const redisClient = getRedis();
    await redisClient.del(key);
}

module.exports = {
    set,
    get,
    del
};
