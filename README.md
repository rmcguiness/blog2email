# Blog2Email

Blog2Email is a web application that allows you to subscribe to your favorite blogs and receive email notifications when new content is published. Never miss a post from your favorite writers again!

## Features

- 📬 Email notifications for new blog posts
- 🔍 Automatic RSS feed detection
- ⚡ Real-time updates
- 👤 User authentication via Supabase
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Nodemailer
- **RSS Parsing**: rss-parser

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Supabase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/blog2email.git
cd blog2email
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

4. Set up the Supabase database:

Create the following tables in your Supabase dashboard:

- `profiles` - User profiles

  - `id` (uuid, primary key)
  - `email` (text)
  - `created_at` (timestamp with time zone)

- `blogs` - Blog subscriptions

  - `id` (uuid, primary key)
  - `created_at` (timestamp with time zone)
  - `title` (text)
  - `url` (text)
  - `feed_url` (text)
  - `last_checked` (timestamp with time zone, nullable)
  - `last_post_date` (timestamp with time zone, nullable)
  - `user_id` (uuid, foreign key to profiles.id)

- `blog_posts` - Blog posts
  - `id` (uuid, primary key)
  - `created_at` (timestamp with time zone)
  - `blog_id` (uuid, foreign key to blogs.id)
  - `title` (text)
  - `description` (text, nullable)
  - `url` (text)
  - `published_at` (timestamp with time zone)
  - `sent_at` (timestamp with time zone, nullable)

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Cron Job Setup

The application needs a scheduler to check for new blog posts. You can set up a cron job to call the `/api/cron/check-feeds` endpoint.

For Vercel deployment, you can use Vercel Cron Jobs to call this endpoint at regular intervals (e.g., every hour).

For local development, you can use tools like:

- Curl or wget to manually trigger the endpoint
- A cron job scheduler on your machine

Example cron command (runs every hour):

```bash
0 * * * * curl -X GET "https://yourdomain.com/api/cron/check-feeds?apiKey=your-secret-api-key"
```

Make sure to set the `CRON_API_KEY` environment variable to secure the endpoint.

## Deployment

The easiest way to deploy this application is using Vercel:

```bash
npm run build
vercel deploy
```

Don't forget to set up your environment variables in the Vercel dashboard.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
