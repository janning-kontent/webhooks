import type { NextApiRequest, NextApiResponse } from 'next';
import { twitterClient } from '../../utils/twitter/twitter';
import { getContentItem } from '../../utils/kontent/getContentItem';
import fs from 'fs';
import axios from 'axios';
import { JSDOM } from 'jsdom';

let webhookData: any = null;

function convertHtmlToTweet(html: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Convert bold and italic using Unicode characters
    doc.querySelectorAll("strong, b").forEach(el => el.textContent = `𝐁𝐨𝐥𝐝`);
    doc.querySelectorAll("em, i").forEach(el => el.textContent = `𝘐𝘵𝘢𝘭𝘪𝘤`);

    // Convert hyperlinks to plain text URLs
    doc.querySelectorAll("a").forEach(link => {
        const url = link.getAttribute("href") || "";
        link.textContent = `${link.textContent} (${url})`;
    });

    // Extract plain text with line breaks
    return doc.body.textContent?.trim() || "";
}

function formatHashtags(hashtags: string[]): string {
    return hashtags.map(tag => `#${tag}`).join(' ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { notifications } = req.body;

        if (notifications && notifications.length > 0) {
            const { data, message } = notifications[0];
            const { system } = data;
            const {
                id: systemId,
                name: systemName,
                codename: systemCodename,
                collection: systemCollection,
                workflow: systemWorkflow,
                workflow_step: systemWorkflowStep,
                language: systemLanguage,
                type: systemType,
                last_modified: systemLastModified
            } = system;

            const {
                environment_id: messageEnvironmentId,
                object_type: messageObjectType,
                action: messageAction,
                delivery_slot: messageDeliverySlot
            } = message;

            webhookData = {
                systemId,
                systemName,
                systemCodename,
                systemCollection,
                systemWorkflow,
                systemWorkflowStep,
                systemLanguage,
                systemType,
                systemLastModified,
                messageEnvironmentId,
                messageObjectType,
                messageAction,
                messageDeliverySlot
            };

            try {
                const response = await getContentItem(system.codename);
                const post = response.data.item.elements.post?.value || null;
                const formattedText = convertHtmlToTweet(post);
                const hashtags = response.data.item.elements.hashtags?.value || [];
                let formattedHashtags = '';
                if (hashtags.length > 0) {
                    formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
                }

                const adHocHashtags = response.data.item.elements.hashtags__ad_hoc_?.value || '';
                let formattedAdHocHashtags = '';
                if (adHocHashtags) {
                    formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
                }

                const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();

                let mediaId: string | null = null;
                if (response.data.item.elements.image?.value) {
                    const imageUrl = response.data.item.elements.image?.value[0].url;
                    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const mediaData = Buffer.from(imageResponse.data, 'binary');

                    try {
                        mediaId = await twitterClient.v1.uploadMedia(mediaData, { mimeType: 'image/jpeg' });
                    } catch (error) {
                        console.error('Error uploading media:', error);
                    }
                }

                if (mediaId) {
                    const tweetResponse = await twitterClient.v2.tweet({
                        text: `${formattedText}\n\n${finalHashtags}`,
                        media: { media_ids: [mediaId] }
                    });
                    console.log('Tweet success:', tweetResponse);
                } else {
                    const tweetResponse = await twitterClient.v2.tweet(
                        `${formattedText}\n\n${finalHashtags}`
                    );
                    console.log('Tweet success:', tweetResponse);
                }

                res.status(200).json({ message: 'Twitter webhook success' });
            } catch (error) {
                res.status(500).send(`Twitter webhook error: ${error}`);
            }

        } else {
            res.status(200).json({ message: 'No notifications found in the Twitter webhook data' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json(webhookData || { message: 'No data received yet.' });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}