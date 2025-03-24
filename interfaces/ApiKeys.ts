export interface ApiKeys {
    item: {
        system: {
            id: string;
            name: string;
            codename: string;
            language: string;
            type: string;
            collection: string;
            sitemap_locations: string[];
            last_modified: string;
            workflow: string;
            workflow_step: string;
        };
        elements: {
            facebook_client_id: {
                value: string;
            };
            facebook_client_secret: {
                value: string;
            };
            twitter_api_key?: {
                value: string;
            };
            twitter_api_secret: {
                value: string;
            };
            twitter_access_token: {
                value: string;
            };
            twitter_access_secret: {
                value: string;
            };
        };
    };
    modular_content: Record<string, unknown>;
}
