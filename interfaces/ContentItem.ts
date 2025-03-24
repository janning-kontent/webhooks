export interface ContentItem {
    item: {
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
        elements: {
            channel?: {
                value: Array<{ name: string, codename: string }>;
            };
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
            image_url?: {
                value: string;
            };
            video_url?: {
                value: string;
            };
            video?: {
                value: Array<{ url: string }>;
            };
        };
    }
}