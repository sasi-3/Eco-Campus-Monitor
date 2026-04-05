
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production Deployment

This project is configured for seamless deployment to modern SPA hosting providers like Vercel or Render.

### Deploying to Vercel
1. Install the Vercel CLI (`npm i -g vercel`) or sign up at [vercel.com](https://vercel.com).
2. Connect your GitHub repository to your Vercel account.
3. Vercel will automatically detect the Vite build settings (`npm run build`).
4. Set the `GEMINI_API_KEY` Environment Variable in your Vercel project settings.
5. The included `vercel.json` file automatically handles React Router SPA fallback routing.

### Deploying to Render
1. Create a "Static Site" on Render and link your repository.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Add the `GEMINI_API_KEY` under the Environment tab.
5. In the "Redirects/Rewrites" tab, set a Rewrite rule: `Source: /*` -> `Destination: /index.html`.
