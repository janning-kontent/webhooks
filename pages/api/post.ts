import type { NextApiRequest, NextApiResponse } from 'next';

import { getContentItem } from '../../utils/kontent/getContentItem';
import postToTwitter from '../../utils/twitter/postTwitter';
import postToFacebook from '../../utils/facebook/postFacebook';

import { ApiKeys } from '../../interfaces/ApiKeys';
import { ContentItem } from '../../interfaces/ContentItem';
import { post } from 'axios';
import { getManagementClient } from './managementApi';

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

            let status = 'Pending';
            try {
                //Fetch API Keys    
                const apiKeys = await getContentItem('api_keys');
                if (!apiKeys.data) {
                    throw new Error('No API Keys found in the Kontent response');
                } else {
                    const apiKeysData: ApiKeys = apiKeys.data as ApiKeys;

                    // Fetch content item
                    const response = await getContentItem(system.codename);
                    if (!response.data) {
                        throw new Error('No content item found in the Kontent response');
                    } else {
                        const postData: ContentItem = response.data as ContentItem;

                        // Determine the channel and post to Twitter if applicable
                        const channel = postData.item.elements.channel.value[0].codename || null;
                        if (channel === 'twitter_x_') {
                            await postToTwitter(postData, apiKeysData);
                            status = 'Published to Twitter : ' + new Date().toISOString();
                        }

                        if (channel === 'facebook') {
                            await postToFacebook(postData, apiKeysData);
                            status = 'Published to Facebook : ' + new Date().toISOString();
                        }

                        /*
                        const client = getManagementClient();
                        const responseUpdate = await client
                            .upsertLanguageVariant()
                            .byItemCodename(system.codename)
                            .byLanguageCodename('default')
                            .withData((builder) => ({
                                elements: [
                                    builder.textElement({
                                        element: { codename: 'status' },
                                        value: status,
                                    })
                                ]
                            }))
                            .toPromise();
                        console.log(responseUpdate);
                        */

                        res.status(200).json({ message: 'Social Post webhook success' });
                    }
                }
            } catch (err: any) {
                // Handle errors and send detailed response
                const errorDetails = JSON.stringify(err, null, 2);
                console.error('Tweet error:', err);
                res.status(500).json({ message: 'Social Post webhook error', details: JSON.parse(errorDetails) });
                status = 'Error : ' + new Date().toISOString() + ' : ' + JSON.parse(errorDetails);

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
