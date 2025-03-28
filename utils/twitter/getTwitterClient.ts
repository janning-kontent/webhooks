import { TwitterApi } from 'twitter-api-v2';

export const twitterClient = new TwitterApi({
    appKey: process.env.API_KEY!,
    appSecret: process.env.API_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessSecret: process.env.ACCESS_SECRET!,
});

