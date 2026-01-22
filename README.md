# Invisible Brain

Invisible Brain is a voice-powered task orchestration system. It transforms spontaneous spoken thoughts into structured data across your professional ecosystem using high-speed AI.

## Overview
Voice-powered task capture app built with Next.js 14, Groq AI, Notion, and GitHub. Deployed on Vercel.

## Live Access
The app is deployed on Vercel and optimized for mobile use. 🔗 Open the App https://invisible-brain.vercel.app/

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in`.env.local` and fill in your API keys:
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

## Mobile App

Add to your home screen on iPhone or Android for a native app experience:
- **iOS**: Tap Share → Add to Home Screen
- **Android**: Tap Menu → Add to Home Screen

## How It Works

1. Tap the Record button to capture 10 seconds of audio (or tap again to stop early)
2. Audio is transcribed using Groq's Whisper API
3. Llama-3.3-70b classifies it as Task, Issue, or Idea with confidence score
4. Tasks/Ideas go to Notion, Issues go to GitHub
5. View transcription, reasoning, destination, and recent activity log

## Notion Setup

Your Notion database needs a "Category" select property with options: Task, Issue, Idea.
