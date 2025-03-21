import type { NextApiRequest, NextApiResponse } from 'next';
import { ContentItem } from '../../interfaces/ContentItem';
import { getContentItem } from '../../utils/kontent/getContentItem';
import postToTwitter from '../../utils/twitter/postTwitter';

let webhookData: any = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { notifications } = req.body;

        // Check if notifications exist and process the first notification
        if (notifications && notifications.length > 0) {
            const { data, message } = notifications[0];
            const { system } = data;

            // Extract system-related data
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

            // Extract message-related data
            const {
                environment_id: messageEnvironmentId,
                object_type: messageObjectType,
                action: messageAction,
                delivery_slot: messageDeliverySlot
            } = message;

            // Store webhook data for potential GET requests
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
                // Fetch content item from Kontent
                const response = await getContentItem(system.codename);
                if (!response.data) {
                    throw new Error('No content item found in the Kontent response');
                } else {
                    const data: ContentItem = response.data as ContentItem;

                    // Determine the channel and post to Twitter if applicable
                    const channel = data.item.elements.channel?.value[0].name || null;
                    if (channel === 'Twitter(X)') {
                        await postToTwitter(data);
                    }

                    res.status(200).json({ message: 'Social Post webhook success' });
                }
            } catch (error) {
                // Handle errors and send detailed response
                const errorDetails = JSON.stringify(error, null, 2);
                console.error('Tweet error:', error);
                res.status(500).json({ message: 'Social Post webhook error', details: JSON.parse(errorDetails) });
            }

        } else {
            // Handle case where no notifications are found
            res.status(200).json({ message: 'No notifications found in the Social Post webhook data' });
        }
    } else if (req.method === 'GET') {
        // Return stored webhook data or a default message
        res.status(200).json(webhookData || { message: 'No data received yet.' });
    } else {
        // Handle unsupported HTTP methods
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}

