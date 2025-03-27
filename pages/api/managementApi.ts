import { createManagementClient, ManagementClient } from '@kontent-ai/management-sdk';

const environmentId = process.env.KONTENT_ID;
const managementApiKey = process.env.KONTENT_MAPI;

const client = createManagementClient({
    environmentId: environmentId,
    apiKey: managementApiKey
});

export const getManagementClient = () => {
    return client;
}