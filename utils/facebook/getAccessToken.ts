import axios from 'axios';

const FACEBOOK_ACCESS_TOKEN_URL = 'https://graph.facebook.com/oauth/access_token';

interface FacebookAccessTokenResponse {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    [key: string]: any;
}

export const getAccessToken = async (): Promise<string> => {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Facebook Client ID or Client Secret is not defined in environment variables.');
    }

    try {
        const response = await axios.get<FacebookAccessTokenResponse>(`${FACEBOOK_ACCESS_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const data = response.data;
        const accessToken = data.access_token;
        const tokenType = data.token_type;

        return accessToken || '';
    } catch (error) {
        const axiosError = error as any;
        console.error('Axios error posting to Facebook:', JSON.stringify({
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
        }, null, 2));
        throw error;
    }
};
