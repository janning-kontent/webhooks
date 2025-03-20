import { NextApiRequest, NextApiResponse } from "next";
import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { exec } from "child_process";

dotenv.config();

// ✅ Set up Twitter API client
const twitterClient = new TwitterApi({
    appKey: process.env.API_KEY!,
    appSecret: process.env.API_SECRET!,
    accessToken: process.env.ACCESS_TOKEN!,
    accessSecret: process.env.ACCESS_SECRET!,
}).readWrite;

// ✅ Function to download video from a URL using `https` (No Axios!)
const downloadVideo = (videoUrl: string, outputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log("Downloading video...");
        const file = fs.createWriteStream(outputPath);

        https.get(videoUrl, (response) => {
            if (response.statusCode !== 200) {
                return reject(`Failed to download video. Status: ${response.statusCode}`);
            }

            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log("Download complete:", outputPath);

                // ✅ Ensure file exists before resolving
                if (fs.existsSync(outputPath)) {
                    resolve(outputPath);
                } else {
                    reject("Downloaded file not found!");
                }
            });
        }).on("error", (err) => {
            fs.unlinkSync(outputPath);
            reject(`Download failed: ${err.message}`);
        });
    });
};

// ✅ Function to convert the video to a Twitter-compatible MP4
const convertToTwitterCompatibleMP4 = (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log("Re-encoding video to Twitter-compatible format...");

        const ffmpegCommand = `ffmpeg -i "${inputPath}" -c:v libx264 -preset slow -b:v 5000k -maxrate 5000k -bufsize 10000k -vf "scale=1280:-2" -c:a aac -b:a 128k "${outputPath}"`;

        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.error("FFmpeg error:", error);
                return reject(`FFmpeg failed: ${stderr}`);
            }
            console.log("Video re-encoded successfully.");
            resolve();
        });
    });
};

// ✅ Next.js API Route Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        //        const { text, videoUrl } = req.body;
        const text = 'test';
        const videoUrl = 'https://app.iconik.io/share/assets/9dd6ba44-eb0a-11ef-b74c-4ea7213850ba/?object_type=assets&object_id=9dd6ba44-eb0a-11ef-b74c-4ea7213850ba&hash=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaGFyZV9pZCI6ImIyMTllMzFhLWY5ZGMtMTFlZi04Y2VlLTE2NmYyZWY0MjllYiIsInNoYXJlX3VzZXJfaWQiOiJiMjFjODRjNi1mOWRjLTExZWYtOGNlZS0xNjZmMmVmNDI5ZWIiLCJleHAiOjE4OTg4NzExNzQsInN5cyI6Imljb25pay11cyJ9.gwuJSMz67-xf-97wxUuWvkY7xxxFKlBif-qhR-G9IU0';


        if (!text || !videoUrl) {
            return res.status(400).json({ error: "Missing required parameters: text or videoUrl" });
        }

        const tempVideoPath = path.join("/tmp", "temp_video.mp4");
        const convertedVideoPath = path.join("/tmp", "converted_video.mp4");

        // ✅ Step 1: Download the video
        await downloadVideo(videoUrl, tempVideoPath);

        // ✅ Step 2: Convert the video to a Twitter-compatible MP4
        await convertToTwitterCompatibleMP4(tempVideoPath, convertedVideoPath);

        // ✅ Step 3: Verify converted video file before uploading
        if (!fs.existsSync(convertedVideoPath)) {
            return res.status(500).json({ error: "Converted video file does not exist." });
        }

        // ✅ Step 4: Upload the converted video to Twitter
        console.log("Uploading video to Twitter...");
        let mediaId: string;
        try {
            mediaId = await twitterClient.v1.uploadMedia(convertedVideoPath, {
                mimeType: "video/mp4", // ✅ Correct MIME type
                longVideo: true, // ✅ Allows videos longer than 140 seconds
            });
        } catch (uploadError) {
            console.error("Error uploading video:", uploadError);
            return res.status(500).json({ error: "Failed to upload video to Twitter", details: String(uploadError) });
        }

        console.log("Media uploaded successfully with ID:", mediaId);

        // ✅ Step 5: Post the tweet with the uploaded video
        console.log("Posting tweet...");
        let tweet;
        try {
            tweet = await twitterClient.v2.tweet({
                text,
                media: { media_ids: [mediaId] },
            });
        } catch (tweetError) {
            console.error("Error posting tweet:", tweetError);
            return res.status(500).json({ error: "Failed to post tweet", details: String(tweetError) });
        }

        console.log("Tweet posted successfully:", tweet);

        // ✅ Cleanup: Delete the temporary video files
        fs.unlinkSync(tempVideoPath);
        fs.unlinkSync(convertedVideoPath);
        console.log("Temporary video files deleted.");

        return res.status(200).json({ success: true, tweet });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Unexpected server error", details: String(error) });
    }
}