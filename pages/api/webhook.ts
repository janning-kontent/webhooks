import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const webhookData = req.body;

        // Process the webhook data here
        console.log('Received webhook data:', webhookData);

        // Send a response back
        res.status(200).json({ message: 'Webhook received successfully' });

        var msg = '';

        if (req && req.body) {
            const notification = req.body as WebhookNotification;
            console.log('Received webhook data:', notification);

            if (await notification.data.items) {
                var workflowItem = await notification.data.items[0];
                const itemId = workflowItem.item.id;
                msg = 'Item ID: ' + itemId;
            } else {
                msg = 'No items found in the webhook data';
            }
        }
        res.status(200).json({ message: msg });

    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
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
}

export interface Message {
    id: string;
    project_id: string;
    type: string;
    operation: string;
    api_name: string;
    created_timestamp: string;
    webhook_url: string;
}

export interface WebhookNotification {
    data: Data;
    message: Message;
}
