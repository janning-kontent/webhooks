import { ApiKeys } from "../../interfaces/ApiKeys";
import { ContentItem } from "../../interfaces/ContentItem";
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { TwitterApi } from 'twitter-api-v2';

export default async function twitter(socialPost: ContentItem, apiKeysData: ApiKeys) {

    const twitterClient = new TwitterApi({
        appKey: apiKeysData.item.elements.twitter_api_key?.value || '',
        appSecret: apiKeysData.item.elements.twitter_api_secret.value || '',
        accessToken: apiKeysData.item.elements.twitter_access_token.value || '',
        accessSecret: apiKeysData.item.elements.twitter_access_secret.value || '',
    });

    const post = socialPost.item.elements.post?.value || null;
    const formattedText = convertHtmlToTweet(post);
    const hashtags = socialPost.item.elements.hashtags?.value || [];
    let formattedHashtags = '';
    if (hashtags.length > 0) {
        formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
    }

    const adHocHashtags = socialPost.item.elements.hashtags__ad_hoc_?.value || '';
    let formattedAdHocHashtags = '';
    if (adHocHashtags) {
        formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
    }

    const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();

    let imageId: string | null = null;
    let videoId: string | null = null;

    if (socialPost.item.elements.image?.value && socialPost.item.elements.image?.value.length > 0) {
        const imageUrl = socialPost.item.elements.image?.value[0].url || null;
        imageId = await uploadMedia(imageUrl, "image/jpeg", twitterClient);
    }

    if (socialPost.item.elements.video?.value && socialPost.item.elements.video?.value.length > 0) {
        const videoUrl = socialPost.item.elements.video?.value[0].url || null;
        //const videoUrl = socialPost.item.elements.video_url?.value[0].url || null;
        videoId = await uploadMedia(videoUrl, "video/mp4", twitterClient);
    }

    console.log('imageId:', imageId);
    console.log('videoId:', videoId);

    const tweetPayload: any = {
        text: `${formattedText}\n\n${finalHashtags}`
    };

    if (imageId && videoId) {
        tweetPayload.media = { media_ids: [imageId, videoId] };
    } else if (imageId) {
        tweetPayload.media = { media_ids: [imageId] };
    } else if (videoId) {
        tweetPayload.media = { media_ids: [videoId] };
    }

    const tweetResponse = await twitterClient.v2.tweet(tweetPayload);
    console.log('Tweet success:', tweetResponse);
}

const uploadMedia = async (mediaUrl: string, mediaType: string, twitterClient: TwitterApi): Promise<string> => {
    let mediaId: string | null = null;
    const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const mediaData = Buffer.from(mediaResponse.data as ArrayBuffer);

    try {
        mediaId = await twitterClient.v1.uploadMedia(mediaData, { mimeType: mediaType });
    } catch (error) {
        console.error('Error uploading media:', error);
    }
    return mediaId;
}

function convertHtmlToTweet(html: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    doc.querySelectorAll("strong, b").forEach(el => el.textContent = `𝐁𝐨𝐥𝐝`);
    doc.querySelectorAll("em, i").forEach(el => el.textContent = `𝘐𝘵𝘢𝘭𝘪𝘤`);

    doc.querySelectorAll("a").forEach(link => {
        const url = link.getAttribute("href") || "";
        link.textContent = `${link.textContent} (${url})`;
    });

    return doc.body.textContent?.trim() || "";
}