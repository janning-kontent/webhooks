import { createDeliveryClient } from '@kontent-ai/delivery-sdk';

const environmentId = process.env.NEXT_PUBLIC_ENVIRONMENT_ID;
const client = createDeliveryClient({
    environmentId: process.env.ENVIRONMENT_ID || environmentId || '',
});

export const getDeliveryClient = () => {
    return client;
}