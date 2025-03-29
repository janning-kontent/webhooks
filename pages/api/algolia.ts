import { algoliasearch } from 'algoliasearch';
import { createDeliveryClient } from '@kontent-ai/delivery-sdk';

const deliveryClient = createDeliveryClient({
    environmentId: 'd2c48d04-34f4-00a4-108d-4d31411462ed'
});

const client = algoliasearch('QVX5D1BRXT', 'd3e168e8b3a90a709114b4c73698b857');

const fullIndex = async (req: any, res: any) => {
    let items: Array<{ id: string; name: string; type: string, url: string, content: string }> = [];
    const contentItems = await deliveryClient.items().toPromise();
    if (contentItems) {
        contentItems.data.items.forEach((item: any) => {
            const itemType = item.system.type;
            if (itemType === 'article' || itemType === 'product' || itemType === 'page' || itemType === 'event') {
                let url = '/';
                const urlSlug = item.elements.url?.value || null;
                if (urlSlug) {
                    if (itemType === 'article') {
                        url = url + 'articles/' + urlSlug;
                    } else if (itemType === 'product') {
                        url = url + 'products/' + urlSlug;
                    } else if (itemType === 'page') {
                        url = url + urlSlug;
                    } else if (itemType === 'event') {
                        url = url + 'events/' + urlSlug;
                    }

                    const content = item.elements.content?.value || null;
                    let plainTextContent = '';
                    if (content) {
                        plainTextContent = content
                            .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
                            .replace(/\n/g, " ") // Remove newlines
                            .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
                            .replace(/<script.*?>.*?<\/script>/gi, ""); // Remove JavaScript
                    }
                    items.push({
                        id: item.system.id,
                        name: item.system.name || '',
                        type: item.system.type,
                        url: url,
                        content: plainTextContent,
                    });
                }
            }
        });

        const algolia = await client.saveObjects({ indexName: 'karma_index', objects: items });
        res.status(200).json({ success: true, algolia });
    } else {
        res.status(500).json({ message: 'No items found' });
    }
}

const itemIndex = async (req: any, res: any) => {
    console.log('Request body:', req.body);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request query:', req.query);
    console.log('Request URL:', req.url);
    console.log('Request path:', req.path);
    console.log('Request params:', req.params);
    console.log('Request cookies:', req.cookies);
    return;

    if (req.method === 'POST') {
        const { notifications } = req.body;

        if (notifications && notifications.length > 0) {
            const { data, message } = notifications[0];
            const { system } = data;

            const {
                id: systemId,
                name: systemName,
                codename: systemCodename,
            } = system;

            try {
                const codename = system.codename;
                const response = await deliveryClient.item(codename).toPromise();
                if (response) {
                    let items: Array<{ id: string; name: string; type: string, url: string, content: string }> = [];
                    const item = response.data.item;
                    const itemType = item.system.type;
                    if (itemType === 'article' || itemType === 'product' || itemType === 'page' || itemType === 'event') {
                        let url = '/';
                        const urlSlug = item.elements.url?.value || null;
                        if (urlSlug) {
                            if (itemType === 'article') {
                                url = url + 'articles/' + urlSlug;
                            } else if (itemType === 'product') {
                                url = url + 'products/' + urlSlug;
                            } else if (itemType === 'page') {
                                url = url + urlSlug;
                            } else if (itemType === 'event') {
                                url = url + 'events/' + urlSlug;
                            }

                            const content = item.elements.content?.value || null;
                            let plainTextContent = '';
                            if (content) {
                                plainTextContent = content
                                    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
                                    .replace(/\n/g, " ") // Remove newlines
                                    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
                                    .replace(/<script.*?>.*?<\/script>/gi, ""); // Remove JavaScript
                            }
                            items.push({
                                id: item.system.id,
                                name: item.system.name || '',
                                type: item.system.type,
                                url: url,
                                content: plainTextContent,
                            });
                        }
                        const algolia = await client.saveObjects({ indexName: 'karma_index', objects: items });
                        res.status(200).json({ success: true, algolia });
                    }
                } else {
                    res.status(500).json({ message: 'No items found' });
                }
            } catch (err: any) {
                const errorDetails = JSON.stringify(err, null, 2);
                console.error('Error:', err);
                res.status(500).json({ message: 'Social Post webhook error', details: JSON.parse(errorDetails) });

                console.error('Message:', err.message);

                if (err?.data) {
                    console.error('Error data:', err.data);
                }

                if (err?.response) {
                    console.error('Status:', err.response.status);
                    console.error('Status Text:', err.response.statusText);
                    console.error('Headers:', err.response.headers);
                    console.error('Body:', await err.response.text?.());
                }

                try {
                    console.error('Full Error:', JSON.stringify(err, null, 2));
                } catch {
                    console.error(err);
                }

                throw err;
            }
        } else {
            res.status(200).json({ message: 'No notifications found in the Algolia webhook data' });
        }
    } else if (req.method === 'GET') {
        res.status(500).json({ message: 'GET method not allowed' });
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}

export default async function handler(req: any, res: any) {
    try {

        await itemIndex(req, res);
        //await fullIndex(req, res);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}