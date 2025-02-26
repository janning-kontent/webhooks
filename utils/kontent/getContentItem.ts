import axios from 'axios';

export const getContentItem = async (id: string) => {

    const kontentDAPIURL = process.env.KONTENT_DAPI_URL;
    const kontentID = process.env.KONTENT_ID;
    const kontentDAPI = process.env.KONTENT_DAPI;
    const kontentURL = `${kontentDAPIURL}/${kontentID}/items/${id}`;
    try {
        const response = await axios.get(kontentURL, {
            headers: {
                Authorization: `Bearer ${kontentDAPI}`, // Add this line
                Accept: 'application/json',
            }
        });
        //console.log('Kontent response:', response.data.item.elements.image);
        return response;
    } catch (error) {
        const axiosError = error as any;
        console.error('Error getting Content Item:', JSON.stringify({
            message: axiosError.message,
            status: axiosError.response?.status,
            data: axiosError.response?.data,
        }, null, 2));
        throw error;
    }
};