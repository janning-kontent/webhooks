import type { NextApiRequest, NextApiResponse } from 'next';
import { twitterClient } from '../../utils/twitter/twitter';
import { postToFacebook } from '../../utils/facebook/facebook';
import { getFacebookAccessToken } from '../../utils/facebook/getAccessToken';
import { getContentItem } from '../../utils/kontent/getContentItem';

let webhookData: any = null;

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

            let testId = "test";//"ecf0947e-fc58-4bbc-a32e-9fca8209e9e8"



            try {
                //const response = await postToFacebook(message);
                //const response = await getFacebookAccessToken();
                const response = await getContentItem(testId);
                const title = response.data.item.elements.title?.value;
                const body = response.data.item.elements.body?.value;
                const image = response.data.item.elements.image?.value[0].url;
                console.log('Response:', response.data.item.elements);
                console.log('Test:', title);
                console.log('Test:', body);
                console.log('Test:', image);
                res.status(200).json({ message: 'Webhook success' });
            } catch (error) {
                res.status(500).send(`Webhook error: ${error}`);
            }


            // try {
            //     const tweetResponse = await twitterClient.v2.tweet(`New item published with ID: ${systemId}`);
            //     console.log('Tweet success:', tweetResponse);
            //     res.status(200).json({ message: 'Tweet success', details: JSON.parse(tweetResponse.data.text) });
            // } catch (error) {
            //     const errorDetails = JSON.stringify(error, null, 2);
            //     console.error('Tweet error:', errorDetails);
            //     res.status(200).json({ message: 'Tweet error', details: JSON.parse(errorDetails) });
            // }
        } else {
            res.status(200).json({ message: 'No notifications found in the webhook data' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json(webhookData || { message: 'No data received yet.' });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}