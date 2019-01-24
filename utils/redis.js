const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis);

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const client = () => redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

module.exports = client;
