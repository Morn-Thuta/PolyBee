import OpenAI from 'openai'

/**
 * Groq client using the OpenAI-compatible SDK.
 * Groq provides free, fast inference for open-source models.
 * Docs: https://console.groq.com/docs/openai
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

/**
 * Generate notes using Groq (llama-3.3-70b-versatile).
 * 128k context window — handles large lecture slide text with ease.
 */
export async function generateNotes(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content || content.trim().length === 0) {
    throw new Error('Groq returned an empty response')
  }

  return content.trim()
}
