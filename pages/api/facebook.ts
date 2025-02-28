import type { NextApiRequest, NextApiResponse } from 'next';
import { getContentItem } from '../../utils/kontent/getContentItem';
import axios from 'axios';

let webhookData: any = null;

interface ContentItem {
    [x: string]: any;
    post?: string;
    hashtags?: string;
    hashtags__ad_hoc_?: string;
    image?: string;
}

const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
const pageId = process.env.FACEBOOK_PAGE_ID;

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
                const response = await <ContentItem>getContentItem(system.codename);
                const data = response.data;
                const post = data.item.elements.post?.value || null;

                const hashtags = data.item.elements.hashtags?.value || [];
                let formattedHashtags = '';
                if (hashtags.length > 0) {
                    formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
                }

                const adHocHashtags = data.item.elements.hashtags__ad_hoc_?.value || '';
                let formattedAdHocHashtags = '';
                if (adHocHashtags) {
                    formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
                }

                const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();
                const imageUrl = data.item.elements.image?.value[0].url;

                const postResponse = await axios.post(
                    `https://graph.facebook.com/${pageId}/photos`,
                    {
                        message: post + '\n\n' + finalHashtags,
                        url: imageUrl,
                        access_token: access_token
                    }
                );

                console.log('Post success:', postResponse.data);
                res.status(200).json({ message: 'Facebook webhook success' });
            } catch (error) {
                const errorDetails = JSON.stringify(error, null, 2);
                console.error('Facebook post error:', errorDetails);
                res.status(500).json({ message: 'Facebook webhook error', details: JSON.parse(errorDetails) });
            }

        } else {
            res.status(200).json({ message: 'No notifications found in the Facebook webhook data' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json(webhookData || { message: 'No data received yet.' });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}