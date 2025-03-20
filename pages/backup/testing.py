import requests # type: ignore
import os
import subprocess

def download_video(url, output_filename):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(output_filename, 'wb') as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        print(f"Downloaded {output_filename}")
        return output_filename
    else:
        print("Failed to download video")
        return None

def convert_to_mp4(input_file, output_file):
    command = ["ffmpeg", "-i", input_file, "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "128k", output_file]
    subprocess.run(command, check=True)
    print(f"Converted to {output_file}")
    return output_file

# Example usage
video_url = "https://app.iconik.io/share/assets/9dd6ba44-eb0a-11ef-b74c-4ea7213850ba/?object_type=assets&object_id=9dd6ba44-eb0a-11ef-b74c-4ea7213850ba&hash=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaGFyZV9pZCI6ImIyMTllMzFhLWY5ZGMtMTFlZi04Y2VlLTE2NmYyZWY0MjllYiIsInNoYXJlX3VzZXJfaWQiOiJiMjFjODRjNi1mOWRjLTExZWYtOGNlZS0xNjZmMmVmNDI5ZWIiLCJleHAiOjE4OTg4NzExNzQsInN5cyI6Imljb25pay11cyJ9.gwuJSMz67-xf-97wxUuWvkY7xxxFKlBif-qhR-G9IU0"
downloaded_file = "video_input.avi"
mp4_file = "video_output.mp4"

if download_video(video_url, downloaded_file):
    convert_to_mp4(downloaded_file, mp4_file)
    os.remove(downloaded_file)  # Clean up the original file