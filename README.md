# Kilo Knowledge Base 📚

An AI-powered knowledge base application that lets you upload PDF documents and chat with them using Google's Gemini AI. Built with Next.js 16, Supabase, and the Gemini File Search API.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange)

## ✨ Features

- 🤖 **AI-Powered Chat** - Ask questions about your documents and get instant, accurate answers
- 📄 **PDF Upload** - Upload and process PDF documents (up to 10MB each)
- 🗂️ **Organization** - Create up to 5 knowledge bases to organize different document sets
- 🔒 **Secure Authentication** - Google OAuth integration via Supabase
- 📊 **Usage Tracking** - Monitor your daily query limits and storage usage
- 🎯 **Rate Limiting** - Built-in quota management (100 queries/day, 100MB storage)
- 🎨 **Modern UI** - Clean, responsive design with helpful empty states
- 🚀 **Production Ready** - Security headers, health checks, and deployment documentation

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A [Supabase](https://supabase.com) account and project
- A [Google Cloud Platform](https://console.cloud.google.com) account
- Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/kilo-knowledage-base.git
cd kilo-knowledage-base
```

2. **Install dependencies**

```bash
npm install --legacy-peer-deps
```

> **Note:** We use `--legacy-peer-deps` because `react-joyride` (used for the welcome tour) doesn't yet support React 19. The library works fine despite the peer dependency warning.

3. **Set up environment variables**

Copy the example environment file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase (from https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API (from https://aistudio.google.com/app/apikey)
# Both variables should use the same API key:
GEMINI_API_KEY=your-gemini-api-key  # For file upload/management
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key  # Required by Vercel AI SDK for chat

# Google OAuth (from https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

4. **Set up your Supabase database**

Run the migrations in order from the `supabase/migrations/` folder in your Supabase SQL Editor:

```bash
supabase/migrations/001_knowledge_bases.sql
supabase/migrations/002_files.sql
supabase/migrations/003_enable_rls.sql
supabase/migrations/004_usage_tracking.sql
```

5. **Create Supabase Storage bucket**

In your Supabase dashboard:
- Go to Storage
- Create a new bucket named `files`
- Set it to **Private**
- Apply the storage policies from the migration files

6. **Configure Google OAuth**

In Google Cloud Console:
- Go to APIs & Credentials
- Create OAuth 2.0 Client ID (Web application)
- Add authorized redirect URIs:
  - `http://localhost:3000/auth/callback` (development)
  - `https://your-domain.com/auth/callback` (production)

7. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a Knowledge Base

1. Click "Create Your First Knowledge Base"
2. Enter a name and description
3. Click "Create"

### Uploading Documents

1. Click on a knowledge base
2. Drag and drop PDF files or click to browse
3. Wait for processing (usually < 1 minute)
4. Files will show "Ready" status when complete

### Chatting with Your Documents

1. Click "Chat with Documents" on a knowledge base with ready files
2. Ask questions in natural language
3. Get AI-powered answers with context from your documents

### Monitoring Usage

- Click "View Usage & Limits" to see:
  - Daily query count (100/day limit)
  - Storage usage (100MB limit)
  - Knowledge base count (5 max)

## 🏗️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **Storage**: Supabase Storage
- **AI**: Google Gemini File Search API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## 📊 Application Limits

| Resource | Limit per User |
|----------|----------------|
| Knowledge Bases | 5 |
| Files per KB | 10 |
| File Size | 10MB |
| Daily Queries | 100 |
| Total Storage | 100MB |

*Limits can be adjusted in `src/lib/quota-enforcement.ts`*

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Content Security Policy** - Protection against XSS attacks
- **Security Headers** - HSTS, X-Frame-Options, etc.
- **Rate Limiting** - Protection against abuse
- **OAuth 2.0** - Secure authentication
- **Input Validation** - File type and size validation

## 📁 Project Structure

```
kilo-knowledage-base/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Main application
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and helpers
│   └── types/                 # TypeScript types
├── supabase/migrations/       # Database migrations
├── .env.local.example         # Environment template
├── DEPLOYMENT.md              # Production deployment guide
└── README.md                  # This file
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kilo-knowledage-base)

1. Click the button above
2. Add environment variables in Vercel dashboard
3. Deploy!

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Health Check Endpoints

Monitor application health:

```bash
# Health check
curl http://localhost:3000/api/health

# Application metrics
curl http://localhost:3000/api/metrics
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📧 Support

For issues and questions:
- Create an issue in this repository
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review the built-in help documentation (Help button in dashboard)

## 🗺️ Roadmap

- [ ] Add Sentry error tracking
- [ ] Implement Vercel Analytics
- [ ] Create custom analytics dashboard
- [ ] Support for more file formats (DOCX, TXT, etc.)
- [ ] Team collaboration features
- [ ] Advanced search filters
- [ ] Export chat history
- [ ] Mobile app

---

Built with ❤️ using Next.js and Google Gemini AI
