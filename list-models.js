/**
 * List all available Gemini models for your API key
 * Run with: node list-models.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  console.log('Fetching available Gemini models...\n');

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✓ API key found:', apiKey.substring(0, 10) + '...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models using the API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.log('❌ No models found for this API key.');
      console.log('\nPossible reasons:');
      console.log('1. API key is invalid or expired');
      console.log('2. API key doesn\'t have access to Gemini models');
      console.log('3. You need to enable the Gemini API in Google AI Studio');
      console.log('\nSolution: Get a new API key from https://aistudio.google.com/app/apikey');
      process.exit(1);
    }
    
    console.log('✅ Available models:\n');
    
    // Filter for models that support generateContent
    const contentModels = data.models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    if (contentModels.length === 0) {
      console.log('❌ No models support generateContent method.');
      process.exit(1);
    }
    
    contentModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    // Recommend the first available model
    const recommendedModel = contentModels[0].name.replace('models/', '');
    console.log(`\n✨ RECOMMENDED MODEL: ${recommendedModel}`);
    console.log(`\nUpdate lib/ai/gemini.ts to use this model:`);
    console.log(`getGeminiModel(modelName: string = '${recommendedModel}')`);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.message.includes('403') || error.message.includes('401')) {
      console.error('\n🔑 API Key Issue:');
      console.error('Your API key is invalid or doesn\'t have access.');
      console.error('Get a new key from: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('429')) {
      console.error('\n⏱️ Rate Limit:');
      console.error('Too many requests. Wait a minute and try again.');
    } else {
      console.error('\n💡 Suggestion:');
      console.error('Check your internet connection and API key.');
    }
    
    process.exit(1);
  }
}

listModels();
