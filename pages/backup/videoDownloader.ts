import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const downloadVideo = (url: string, outputPath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const tempPath = outputPath.replace(/\.mp4$/, '.temp');
        const file = fs.createWriteStream(tempPath);

        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download video. Status code: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(tempPath);
            });
        }).on('error', (error) => {
            fs.unlink(tempPath, () => { });
            reject(error);
        });
    });
};

const convertToMp4 = (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .on('end', () => {
                fs.unlinkSync(inputPath); // Remove temp file after conversion
                console.log('Conversion complete:', outputPath);
                resolve();
            })
            .on('error', reject)
            .run();
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const videoUrl = 'https://app.iconik.io/share/assets/9dd6ba44-eb0a-11ef-b74c-4ea7213850ba/?object_type=assets&object_id=9dd6ba44-eb0a-11ef-b74c-4ea7213850ba&hash=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaGFyZV9pZCI6ImIyMTllMzFhLWY5ZGMtMTFlZi04Y2VlLTE2NmYyZWY0MjllYiIsInNoYXJlX3VzZXJfaWQiOiJiMjFjODRjNi1mOWRjLTExZWYtOGNlZS0xNjZmMmVmNDI5ZWIiLCJleHAiOjE4OTg4NzExNzQsInN5cyI6Imljb25pay11cyJ9.gwuJSMz67-xf-97wxUuWvkY7xxxFKlBif-qhR-G9IU0';
    const outputPath = path.join(process.cwd(), 'public', 'downloaded_video.mp4');

    try {
        console.log('Downloading video...');
        const tempPath = await downloadVideo(videoUrl, outputPath);

        console.log('Converting to MP4...');
        await convertToMp4(tempPath, outputPath);

        res.status(200).json({ message: 'Video saved', filePath: `/downloaded_video.mp4` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Video processing failed' });
    }
}


