import axios from 'axios';

const FACEBOOK_ACCESS_TOKEN_URL = 'https://graph.facebook.com/oauth/access_token';

export const getFacebookAccessToken = async (): Promise<string> => {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Facebook Client ID or Client Secret is not defined in environment variables.');
    }

    try {
        const response = await axios.get(`${FACEBOOK_ACCESS_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        return response.data.access_token;
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
