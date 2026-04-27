import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Singleton Google Generative AI client
 * Uses gemini-2.5-flash model (stable, fast, and widely available)
 */
export function getGeminiClient(): GoogleGenerativeAI {
  // Read the key fresh every call so env var changes (new key in .env.local
  // after a restart) are always picked up without stale singleton issues.
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set')
  }

  return new GoogleGenerativeAI(apiKey)
}

/**
 * Get the Gemini model instance
 * @param modelName - Model name (default: gemini-2.5-flash)
 */
export function getGeminiModel(modelName: string = 'gemini-2.5-flash') {
  const client = getGeminiClient()
  return client.getGenerativeModel({ model: modelName })
}
