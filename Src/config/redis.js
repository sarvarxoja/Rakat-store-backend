import { createClient } from "redis";

const redisClient = createClient({
    url: 'redis://localhost:6379', // Redis server manzili
});

redisClient.on('error', (err) => {
    console.log('Redis-ga ulanishda xatolik:', err);
});

redisClient.connect().then(() => {
    console.log('Redis-ga muvaffaqiyatli ulandi');
});

export default redisClient;