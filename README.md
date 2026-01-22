# Invisible Brain

Voice-powered task capture app built with Next.js 14, Groq AI, Notion, and GitHub.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your API keys:
```
GROQ_API_KEY=your_groq_api_key
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=your_repo
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. Tap the Record button to capture 10 seconds of audio (or tap again to stop early)
2. Audio is transcribed using Groq's Whisper API
3. Llama-3-70b classifies it as Task, Issue, or Idea
4. Tasks/Ideas go to Notion, Issues go to GitHub

## Notion Setup

Your Notion database needs a "Category" select property with options: Task, Issue, Idea.
