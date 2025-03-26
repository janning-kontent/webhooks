import { ApiKeys } from "../../interfaces/ApiKeys";
import { ContentItem } from "../../interfaces/ContentItem";
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from "stream";

export default async function twitter(socialPost: ContentItem, apiKeysData: ApiKeys) {

    const client = new TwitterApi({
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
    const tweetPayload: any = {
        text: `${formattedText}\n\n${finalHashtags}`
    };

    let imageId: string | null = null;
    let videoId: string | null = null;

    if (socialPost.item.elements.image?.value && socialPost.item.elements.image?.value.length > 0) {
        const imageUrl = socialPost.item.elements.image?.value[0].url || null;
        imageId = await uploadMedia(imageUrl, "image/jpeg", client);
    }

    if (socialPost.item.elements.video_url?.value && socialPost.item.elements.video_url?.value.length > 0) {
        //const videoUrl = socialPost.item.elements.video?.value[0].url || null;
        const videoUrl = socialPost.item.elements.video_url?.value || null;
        //videoId = await uploadMedia(videoUrl, "video/mp4", client);
        videoId = await uploadVideo(videoUrl, client);
    }

    console.log('imageId:', imageId);
    console.log('videoId:', videoId);
    if (imageId && videoId) {
        tweetPayload.media = { media_ids: [imageId, videoId] };
    } else if (imageId) {
        tweetPayload.media = { media_ids: [imageId] };
    } else if (videoId) {
        tweetPayload.media = { media_ids: [videoId] };
    }

    const tweetResponse = await client.v2.tweet(tweetPayload);
    console.log('Tweet success:', tweetResponse);
}

const uploadMedia = async (mediaUrl: string, mediaType: string, client: TwitterApi): Promise<string> => {
    let mediaId: string | null = null;
    const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const mediaData = Buffer.from(mediaResponse.data as ArrayBuffer);

    try {
        mediaId = await client.v1.uploadMedia(mediaData, { mimeType: mediaType });
    } catch (error) {
        console.error('Error uploading media:', error.data);
    }
    return mediaId;
}

async function downloadVideo(url: string): Promise<string> {
    //const downloadsDir = path.resolve(__dirname, '../../../downloads'); // 🔁 adjust for project root
    const downloadsDir = path.resolve(__dirname, '/tmp'); // 🔁 adjust for project root
    //const writer = fs.createWriteStream(tmpPath);

    // Create the downloads folder if it doesn't exist
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate unique filename
    //const filename = `video-${uuidv4()}.mp4`;
    //const filePath = path.join(downloadsDir, filename);
    const filePath = path.join('/tmp/', 'video.mp4');

    // Stream video to file
    const response = await axios.get<Readable>(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', () => resolve());
        writer.on('error', reject);
    });

    return filePath;
}

export async function uploadVideo(videoUrl: string, client: TwitterApi): Promise<string> {
    try {
        const filePath = await downloadVideo(videoUrl);
        const mediaSize = fs.statSync(filePath).size;
        const chunkSize = 5 * 1024 * 1024; // 5MB
        const mediaType = 'video/mp4';
        //       console.log('filePath:', filePath);
        //       console.log('mediaSize:', mediaSize);
        //       console.log('chunkSize:', chunkSize);
        if (mediaSize > (512 * 1024 * 1024)) {
            throw new Error('❌ Video file exceeds Twitter maximum upload size of 512MB. Please compress it.');
        }
        // INIT
        // const initResponse = await client.v1.post('media/upload.json', {
        //     command: 'INIT',
        //     total_bytes: mediaSize,
        //     media_type: mediaType,
        // });

        //const mediaId = initResponse.media_id_string;
        const mediaId = await client.v1.uploadMedia(filePath, { mimeType: 'video/mp4' });
        //        console.log('mediaId:', mediaId);

        // // APPEND
        // const fileStream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
        // let segmentIndex = 0;

        // for await (const chunk of fileStream) {
        //     await client.v1.post('media/upload', {
        //         command: 'APPEND',
        //         media_id: mediaId,
        //         segment_index: segmentIndex,
        //         media: chunk,
        //     });
        //     segmentIndex++;
        // }

        // // FINALIZE
        // await client.v1.post('media/upload', {
        //     command: 'FINALIZE',
        //     media_id: mediaId,
        // });

        // POST TWEET
        //await client.v1.tweet(tweetText, { media_ids: [mediaId] });

        console.log('✅ Uploaded video successfully!');
        fs.unlinkSync(filePath);

        return mediaId;
    } catch (err: any) {
        console.error('❌ Upload failed.');

        // Log top-level error message
        console.error('Message:', err.message);

        // Log response status and data if available
        if (err?.data) {
            console.error('Twitter error data:', err.data);
        }

        if (err?.response) {
            console.error('Status:', err.response.status);
            console.error('Status Text:', err.response.statusText);
            console.error('Headers:', err.response.headers);
            console.error('Body:', await err.response.text?.());
        }

        // Log full error object as JSON fallback
        try {
            console.error('Full Error:', JSON.stringify(err, null, 2));
        } catch {
            console.error(err);
        }

        throw err;
    }
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