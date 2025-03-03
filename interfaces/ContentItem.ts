export interface ContentItem {
    id: string;
    name: string;
    codename: string;
    collection: string;
    workflow: string;
    workflow_step: string;
    language: string;
    type: string;
    last_modified: string;
    elements: {
        post?: {
            value: string;
        };
        hashtags?: {
            value: Array<{ name: string }>;
        };
        hashtags__ad_hoc_?: {
            value: string;
        };
        image?: {
            value: Array<{ url: string }>;
        };
    };
}