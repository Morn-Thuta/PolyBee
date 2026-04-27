/**
 * Quick test script to verify Gemini API connection
 * Run with: node test-gemini.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
  console.log('Testing Gemini API connection...\n');

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✓ API key found');
  console.log('✓ API key starts with:', apiKey.substring(0, 10) + '...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('Testing model: gemini-2.5-flash');
    console.log('Sending test prompt...\n');

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Say "Hello, PolyBee!" in exactly 3 words.',
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! Gemini API is working correctly.\n');
    console.log('Response:', text);
    console.log('\n✓ Note generation should work now!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\nSolution: Check your API key at https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
      console.error('\nSolution: Wait 1-2 minutes or get a new API key');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.error('\nSolution: The model name might be incorrect');
    }
    
    process.exit(1);
  }
}

testGemini();
