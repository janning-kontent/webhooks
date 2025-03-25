import type { NextApiRequest, NextApiResponse } from 'next';
import { ContentItem } from '../../interfaces/ContentItem';
import { getContentItem } from '../kontent/getContentItem';
import axios from 'axios';

let webhookData: any = null;

const page_access_token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
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
                const response = await getContentItem(system.codename);
                if (!response.data) {
                    throw new Error('No data found in the Kontent response');
                } else {
                    const data: ContentItem = response.data as ContentItem;
                    const post = data.item.elements.post?.value || null;
                    console.log(post);

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
                        //`https://graph.facebook.com/${pageId}/feed`,
                        {
                            message: post + '\n\n' + finalHashtags,
                            url: imageUrl,
                            access_token: page_access_token
                        }
                    );

                    console.log('Post success:', postResponse.data);
                    res.status(200).json({ message: 'Facebook webhook success', data: postResponse.data });
                }
            } catch (error) {
                const errorDetails = JSON.stringify(error, null, 2);
                console.error('Facebook post error:', JSON.stringify(error.response?.data, null, 2));
                res.status(500).json({ message: 'Facebook webhook error', details: JSON.stringify(error.response?.data, null, 2) });
                throw new Error(error);
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