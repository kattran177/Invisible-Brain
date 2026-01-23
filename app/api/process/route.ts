import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { Client } from '@notionhq/client'
import { Octokit } from '@octokit/rest'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const notion = new Client({ auth: process.env.NOTION_API_KEY })
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB limit
const MAX_AUDIO_DURATION = 300 // 5 minutes in seconds

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob

    // Check file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 400 })
    }

    // Transcribe with Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: new File([audioFile], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-large-v3',
    })

    const transcript = transcription.text

    // Classify with Llama-3
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a classifier. Analyze the text and return ONLY a JSON object with three fields: "category" (must be exactly "Task", "Issue", or "Idea"), "content" (a cleaned-up version of the text), and "confidence" (a number between 0-100). No other text.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    const { category, content, confidence } = result

    let destination = ''
    // Send to Notion or GitHub based on category
    if (category === 'Task' || category === 'Idea') {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID! },
        properties: {
          Name: { title: [{ text: { content: content } }] },
          Category: { select: { name: category } },
        },
      })
      destination = 'Notion'
    } else if (category === 'Issue') {
      await octokit.issues.create({
        owner: process.env.GITHUB_REPO_OWNER!,
        repo: process.env.GITHUB_REPO_NAME!,
        title: content.substring(0, 100),
        body: content,
      })
      destination = 'GitHub Issues'
    }

    return NextResponse.json({ transcript, category, content, confidence, destination })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
