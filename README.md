## Setup Instructions

1. **Clone the repository** (if applicable):

   ```bash
   git clone <repository-url>
   cd webhooks
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

## Webhook Setup

Facebook webhook API is located at `/api/facebook`
Twitter webhook API is located at `/api/twitter`

## Facebook tokens

Go to Facebook Graph API Explorer and check if you have the required permissions.
https://developers.facebook.com/tools/explorer/

1. Generate a User Access Token with:
   ```bash
   • pages_read_engagement
   • pages_manage_posts
   • publish_to_groups (if posting to a group)
   ```
2. If posting to a Page, use a Page Access Token.
   https://graph.facebook.com/v18.0/oauth/access_token
   ?grant_type=fb_exchange_token
   &client_id={your-app-id}
   &client_secret={your-app-secret}
   &fb_exchange_token={short-lived-user-token}
3. Then, exchange it for a Page Access Token:
   https://graph.facebook.com/v18.0/{page-id}?fields=access_token&access_token={long-lived-user-token}
