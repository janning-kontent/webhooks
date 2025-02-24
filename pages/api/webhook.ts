import type { NextApiRequest, NextApiResponse } from 'next';

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

            console.log('Received webhook data:', req.body);
            res.status(200).json({ message: `Item ID: ${systemId}` });
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
