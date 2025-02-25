import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../utils/twitterClient';
import TwitterApi from 'twitter-api-v2';

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

            try {
                const tweetResponse = await client.v2.tweet(`New item published with ID: ${systemId}`);
                console.log('Tweet sent successfully:', tweetResponse);
                res.status(200).json({ message: `Successful tweet: ${tweetResponse.data.text}` });
            } catch (error) {
                //console.error('Error sending tweet:', error);
                console.error('Tweet error data:', JSON.stringify(error, null, 2));
                try {
                    await client.v2.tweet(`Failed to publish item with ID: ${systemId}. Error: ${(error as any).message}`);
                } catch (tweetError) {
                    console.error('Tweet error data:', JSON.stringify(tweetError, null, 2));
                    if (typeof tweetError === 'object' && tweetError !== null && 'data' in tweetError) {
                        console.error('Error details:', JSON.stringify((tweetError as any).data, null, 2));
                    }
                }
                res.status(500).json({ error: 'Failed to send tweet' });
            }
        } else {
            res.status(200).json({ message: 'No notifications found in the webhook data' });
        }
    } else if (req.method === 'GET') {
        res.status(200).json(webhookData || { message: 'No data received yet.' });
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export interface Item {
    id: string;
}

export interface TransitionFrom {
    id: string;
}

export interface TransitionTo {
    id: string;
}

export interface WorkflowEventItem {
    id: string;
    event: string;
    item: Item;
    transition_from: TransitionFrom;
    transition_to: TransitionTo;
}

export interface Data {
    items: WorkflowEventItem[];
    system: {
        id: string;
        name: string;
        codename: string;
        collection: string;
        workflow: string;
        workflow_step: string;
        language: string;
        type: string;
        last_modified: string;
    };
}

export interface Message {
    id: string;
    project_id: string;
    type: string;
    operation: string;
    api_name: string;
    created_timestamp: string;
    webhook_url: string;
    environment_id: string;
    object_type: string;
    action: string;
    delivery_slot: string;
}

export interface WebhookNotification {
    data: Data;
    message: Message;
}
