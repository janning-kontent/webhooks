// import type { NextApiRequest, NextApiResponse } from 'next';
// import { ContentItem } from '../../../interfaces/ContentItem';
// import { twitterClient } from '../../../utils/twitter/getTwitterClient';
// import { getContentItem } from '../../../utils/kontent/getContentItem';
// import axios from "axios";
// import { JSDOM } from 'jsdom';
// import * as dotenv from "dotenv";
// import * as fs from "fs";
// import * as path from "path";
// import FormData from "form-data";

// dotenv.config();

// let webhookData: any = null;

// (async () => {
//     try {
//         const user = await twitterClient.currentUser();
//         console.log("Authenticated as:", user);
//     } catch (error) {
//         console.error("Authentication failed:", error.data);
//     }
// })();

// const UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

// (async () => {
//     try {
//         const response = await axios.get(UPLOAD_URL, {
//             headers: {
//                 Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
//             },
//         });
//         console.log("Upload API Test Response:", response.data);
//     } catch (error: any) {
//         if (error.response && error.response.data && error.response.data.errors) {
//             const errorCode = error.response.data.errors[0].code;
//             if (errorCode === 89) {
//                 console.error("Error reaching Twitter Upload API: Invalid or expired token");
//             } else {
//                 console.error("Error reaching Twitter Upload API:", error.response.data);
//             }
//         } else {
//             console.error("Error reaching Twitter Upload API:", error.message);
//         }
//     }
// })();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'POST') {
//         const { notifications } = req.body;

//         if (notifications && notifications.length > 0) {
//             const { data, message } = notifications[0];
//             const { system } = data;
//             const {
//                 id: systemId,
//                 name: systemName,
//                 codename: systemCodename,
//                 collection: systemCollection,
//                 workflow: systemWorkflow,
//                 workflow_step: systemWorkflowStep,
//                 language: systemLanguage,
//                 type: systemType,
//                 last_modified: systemLastModified
//             } = system;

//             const {
//                 environment_id: messageEnvironmentId,
//                 object_type: messageObjectType,
//                 action: messageAction,
//                 delivery_slot: messageDeliverySlot
//             } = message;

//             webhookData = {
//                 systemId,
//                 systemName,
//                 systemCodename,
//                 systemCollection,
//                 systemWorkflow,
//                 systemWorkflowStep,
//                 systemLanguage,
//                 systemType,
//                 systemLastModified,
//                 messageEnvironmentId,
//                 messageObjectType,
//                 messageAction,
//                 messageDeliverySlot
//             };

//             try {
//                 const response = await getContentItem(system.codename);
//                 if (!response.data) {
//                     throw new Error('No data found in the Kontent response');
//                 } else {
//                     const data: ContentItem = response.data as ContentItem;
//                     const post = data.item.elements.post?.value || null;
//                     const formattedText = convertHtmlToTweet(post);
//                     const hashtags = data.item.elements.hashtags?.value || [];
//                     let formattedHashtags = '';
//                     if (hashtags.length > 0) {
//                         formattedHashtags = hashtags.map(tag => `#${tag.name}`).join(' ');
//                     }

//                     const adHocHashtags = data.item.elements.hashtags__ad_hoc_?.value || '';
//                     let formattedAdHocHashtags = '';
//                     if (adHocHashtags) {
//                         formattedAdHocHashtags = adHocHashtags.split(',').map(tag => `#${tag.trim()}`).join(' ');
//                     }

//                     const finalHashtags = `${formattedHashtags} ${formattedAdHocHashtags}`.trim();

//                     let mediaId: string | null = null;
//                     if (data.item.elements.image?.value) {
//                         //const imageUrl = data.item.elements.image?.value[0].url;
//                         //const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//                         //const mediaData = Buffer.from(imageResponse.data as ArrayBuffer);

//                         try {
//                             // mediaId = await twitterClient.v1.uploadMedia(mediaData, { mimeType: 'image/jpeg' });
//                         } catch (error) {
//                             //  console.error('Error uploading media:', error.data);
//                         }
//                     }
//                     console.log("API Key:", process.env.API_KEY);
//                     console.log("API Secret:", process.env.API_SECRET);
//                     console.log("Access Token:", process.env.ACCESS_TOKEN);
//                     console.log("Access Secret:", process.env.ACCESS_SECRET);
//                     //console.log(data);
//                     const videoUrl = data.item.elements.video_url?.value || null;
//                     if (videoUrl && videoUrl.length > 0) {
//                         postTweetWithVideo("Check out this awesome video!", videoUrl);
//                     }

//                     if (mediaId) {
//                         //  const tweetResponse = await twitterClient.v2.tweet({
//                         //      text: `${formattedText}\n\n${finalHashtags}`,
//                         //      media: { media_ids: [mediaId] }
//                         //  });
//                         // console.log('Tweet success:', tweetResponse);
//                     } else {
//                         // const tweetResponse = await twitterClient.v2.tweet(
//                         //     `${formattedText}\n\n${finalHashtags}`
//                         // );
//                         //console.log('Tweet success:', tweetResponse);
//                     }

//                     res.status(200).json({ message: 'Twitter webhook success' });
//                 }
//             } catch (error) {
//                 const errorDetails = JSON.stringify(error, null, 2);
//                 console.error('Tweet error:', errorDetails);
//                 res.status(500).json({ message: 'Twitter webhook error', details: JSON.parse(errorDetails) });
//             }

//         } else {
//             res.status(200).json({ message: 'No notifications found in the Twitter webhook data' });
//         }
//     } else if (req.method === 'GET') {
//         res.status(200).json(webhookData || { message: 'No data received yet.' });
//     } else {
//         res.setHeader('Allow', ['POST', 'GET']);
//         res.status(405).end(`Method ${req.method} not allowed`);
//     }
// }



// // Function to download a video from a URL
// const downloadVideo = async (videoUrl: string, outputPath: string): Promise<string> => {
//     console.log("Downloading video...");

//     const response = await axios({
//         method: "GET",
//         url: videoUrl,
//         responseType: "stream",
//     });

//     const writer = fs.createWriteStream(outputPath);
//     (response.data as NodeJS.ReadableStream).pipe(writer);

//     return new Promise((resolve, reject) => {
//         writer.on("finish", () => {
//             console.log("Download complete:", outputPath);
//             resolve(outputPath);
//         });
//         writer.on("error", reject);
//     });
// };

// // Function to upload video in chunks
// const uploadVideo = async (videoPath: string): Promise<string> => {
//     const fileSize = fs.statSync(videoPath).size;
//     const mediaType = "video/mp4";
//     const mediaFile = fs.createReadStream(videoPath);
//     try {
//         console.log("Initializing video upload...");
//         const initResponse = await twitterClient.v1.post(UPLOAD_URL, {
//             command: "INIT",
//             total_bytes: fileSize,
//             media_type: mediaType,
//             media_category: "tweet_video",
//         });
//         console.log(initResponse);

//         const mediaId = initResponse.media_id_string;
//         console.log("Media ID:", mediaId);

//         // Step 2: APPEND (Upload in chunks)
//         const chunkSize = 5 * 1024 * 1024; // 5MB chunks
//         let segmentIndex = 0;
//         let buffer: Buffer;

//         while ((buffer = mediaFile.read(chunkSize) as Buffer)) {
//             console.log(`Uploading chunk ${segmentIndex}...`);

//             // Create FormData for file upload
//             const formData = new FormData();
//             formData.append("command", "APPEND");
//             formData.append("media_id", mediaId);
//             formData.append("segment_index", segmentIndex.toString());
//             formData.append("media", buffer, { filename: "video.mp4" });

//             await twitterClient.v1.post(UPLOAD_URL, formData, {
//                 headers: { ...formData.getHeaders() },
//             });

//             segmentIndex++;
//         }

//         // Step 3: FINALIZE Upload
//         console.log("Finalizing video upload...");
//         await twitterClient.v1.post(UPLOAD_URL, {
//             command: "FINALIZE",
//             media_id: mediaId,
//         });

//         console.log("Video upload complete!");
//         return mediaId;
//     } catch (error) {
//         console.error("Error initializing video upload:", error.data);
//         throw error;
//     }
// };

// // Function to post a tweet with the uploaded video
// const postTweetWithVideo = async (text: string, videoUrl: string) => {
//     try {
//         const videoPath = path.join(__dirname, "downloaded_video.mp4");

//         // Step 1: Download the video
//         await downloadVideo(videoUrl, videoPath);

//         // Step 2: Upload the video to Twitter
//         const mediaId = await uploadVideo(videoPath);

//         // Step 3: Post the tweet with the uploaded video
//         console.log("Posting tweet...");
//         console.log(mediaId);
//         const tweet = await twitterClient.v2.tweet({
//             text,
//             media: { media_ids: [mediaId] },
//         });

//         console.log("Tweet posted successfully:", tweet);

//         // Cleanup: Delete the downloaded video file after uploading
//         fs.unlinkSync(videoPath);
//         console.log("Temporary video file deleted.");
//     } catch (error) {
//         const errorDetails = JSON.stringify(error, null, 2);
//         console.error("Error posting tweet:", errorDetails);
//         console.log(error);
//     }
// };

// function convertHtmlToTweet(html: string): string {
//     const dom = new JSDOM(html);
//     const doc = dom.window.document;

//     // Convert bold and italic using Unicode characters
//     doc.querySelectorAll("strong, b").forEach(el => el.textContent = `𝐁𝐨𝐥𝐝`);
//     doc.querySelectorAll("em, i").forEach(el => el.textContent = `𝘐𝘵𝘢𝘭𝘪𝘤`);

//     // Convert hyperlinks to plain text URLs
//     doc.querySelectorAll("a").forEach(link => {
//         const url = link.getAttribute("href") || "";
//         link.textContent = `${link.textContent} (${url})`;
//     });

//     // Extract plain text with line breaks
//     return doc.body.textContent?.trim() || "";
// }