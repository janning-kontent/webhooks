import { ApiKeys } from "../../interfaces/ApiKeys";
import { ContentItem } from "../../interfaces/ContentItem";
import axios from 'axios';

export default async function facebook(socialPost: ContentItem, apiKeysData: ApiKeys) {

    const pageAccessToken = apiKeysData.item.elements.facebook_access_token?.value || '';
    const pageId = apiKeysData.item.elements.facebook_page_id?.value || '';

    const post = socialPost.item.elements.post?.value || null;

    const hashtags = socialPost.item.elements.hashtags?.value || [];
    let formattedHashtags = '';
    if (hashtags.length > 0) {
        formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
    }

    const adHocHashtags = socialPost.item.elements.hashtags__ad_hoc_?.value || '';
    let formattedAdHocHashtags = '';
    if (adHocHashtags) {
        formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
    }

    const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();
    const image = socialPost.item.elements.image?.value[0]?.url || '';
    const imageUrl = socialPost.item.elements.image_url?.value || '';
    const finalImageUrl = image.trim() !== '' ? image : imageUrl;

    const postResponse = await axios.post(
        `https://graph.facebook.com/${pageId}/photos`,
        //`https://graph.facebook.com/${pageId}/feed`,
        {
            message: post + '\n\n' + finalHashtags,
            url: finalImageUrl,
            access_token: pageAccessToken
        }
    );

    console.log('Facebook success:', postResponse.data);
}
