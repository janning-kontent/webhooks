import { ContentItem } from "../../interfaces/ContentItem";
import { twitterClient } from '../../utils/twitter/getTwitterClient';
import axios from 'axios';
import { JSDOM } from 'jsdom';

export default async function twitter(socialPost: ContentItem) {
    // Extract and format the post content
    const post = socialPost.item.elements.post?.value || null;
    const formattedText = convertHtmlToTweet(post);

    // Format hashtags
    const hashtags = socialPost.item.elements.hashtags?.value || [];
    let formattedHashtags = '';
    if (hashtags.length > 0) {
        formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
    }

    // Format ad-hoc hashtags
    const adHocHashtags = socialPost.item.elements.hashtags__ad_hoc_?.value || '';
    let formattedAdHocHashtags = '';
    if (adHocHashtags) {
        formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
    }

    // Combine all hashtags
    const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();

    let imageId: string | null = null;
    let videoId: string | null = null;

    // Upload image if available
    if (socialPost.item.elements.image?.value && socialPost.item.elements.image?.value.length > 0) {
        const imageUrl = socialPost.item.elements.image?.value[0].url || null;
        imageId = await uploadMedia(imageUrl, "image/jpeg");
    }

    // Upload video if available
    if (socialPost.item.elements.video?.value && socialPost.item.elements.video?.value.length > 0) {
        const videoUrl = socialPost.item.elements.video?.value[0].url || null;
        videoId = await uploadMedia(videoUrl, "video/mp4");
    }

    // Prepare the tweet payload
    const tweetPayload: any = {
        text: `${formattedText}\n\n${finalHashtags}`
    };

    // Add media IDs to the payload if available
    if (imageId && videoId) {
        tweetPayload.media = { media_ids: [imageId, videoId] };
    } else if (imageId) {
        tweetPayload.media = { media_ids: [imageId] };
    } else if (videoId) {
        tweetPayload.media = { media_ids: [videoId] };
    }

    // Post the tweet
    const tweetResponse = await twitterClient.v2.tweet(tweetPayload);
    console.log('Tweet success:', tweetResponse);
}

// Helper function to upload media to Twitter
const uploadMedia = async (mediaUrl: string, mediaType: string): Promise<string> => {
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

// Helper function to convert HTML content to plain text suitable for a tweet
function convertHtmlToTweet(html: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Replace bold and italic tags with styled text
    doc.querySelectorAll("strong, b").forEach(el => el.textContent = `𝐁𝐨𝐥𝐝`);
    doc.querySelectorAll("em, i").forEach(el => el.textContent = `𝘐𝘵𝘢𝘭𝘪𝘤`);

    // Format links to include their URLs
    doc.querySelectorAll("a").forEach(link => {
        const url = link.getAttribute("href") || "";
        link.textContent = `${link.textContent} (${url})`;
    });

    return doc.body.textContent?.trim() || "";
}