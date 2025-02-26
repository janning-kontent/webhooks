import axios from 'axios';
import { getFacebookAccessToken } from './getAccessToken';

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v11.0';
//const API_BASE = 'https://graph.facebook.com/v15.0';

export const postToFacebook = async (message: string) => {
    try {
        const userToken = await getFacebookAccessToken();
        const pageResp = await fetch(`${FACEBOOK_GRAPH_API_URL}/me/accounts?access_token=${userToken}`);
        console.log('Facebook page response:', pageResp);
        //        const response = await axios.post(
        //        `${FACEBOOK_GRAPH_API_URL}/me/feed`,
        //          {
        //          message,
        //      access_token: getFacebookAccessToken(),
        //    }
        // );
        //console.log('Facebook post response:', response.data);
        return pageResp;
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
