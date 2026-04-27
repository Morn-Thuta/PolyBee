# Quick Test Guide - Note Generation

## ✅ Fixed: Now using `gemini-pro` model

The issue was that `gemini-1.5-flash-latest` is not available in the v1beta API. 

**Solution**: Changed to `gemini-pro` which is the stable, widely-available model.

---

## 🚀 Quick Test Steps

### 1. Clear Cache & Restart
```bash
cd "E:\Kiro Projects\PolyBee"
rm -rf .next
npm run dev
```

### 2. Test API Connection (Optional)
```bash
node test-gemini.js
```

Expected output:
```
✅ SUCCESS! Gemini API is working correctly.
Response: Hello, PolyBee!
✓ Note generation should work now!
```

### 3. Test in Browser
1. Open http://localhost:3000
2. Go to any module
3. Click "New Note"
4. Upload a small PDF or PPTX
5. Enter title
6. Select "Quick Summary" style
7. Click "Generate Notes"
8. Wait 5-15 seconds
9. ✅ Note should appear!

---

## 🔍 What Changed

**File**: `lib/ai/gemini.ts`

**Before**:
```typescript
getGeminiModel(modelName: string = 'gemini-1.5-flash-latest')
```

**After**:
```typescript
getGeminiModel(modelName: string = 'gemini-pro')
```

---

## ⚠️ Troubleshooting

### Still getting 404 errors?
- Make sure you cleared the `.next` folder
- Restart the dev server completely (Ctrl+C, then `npm run dev`)

### Rate limit errors?
- Wait 1-2 minutes between requests
- Free tier: 15 requests per minute
- Or get a new API key from https://aistudio.google.com/app/apikey

### Text extraction fails?
- Make sure the file is a valid PDF or PPTX
- Try a smaller file first (< 5MB)
- Check browser console for detailed errors

---

## 📊 Expected Flow

```
1. Upload File → Supabase Storage ✓
2. Extract Text → officeparser ✓
3. Generate Notes → Gemini API (gemini-pro) ✓
4. Save Note → Supabase Database ✓
5. Display Note → Module Workspace ✓
```

---

## 🎯 Success Indicators

✅ File uploads without errors  
✅ "Text extracted successfully!" toast appears  
✅ Generate button becomes enabled  
✅ "Generating..." spinner shows  
✅ Success toast: "Notes saved to [MODULE]!"  
✅ Dialog closes  
✅ New note appears in the list  

---

## 📝 Model Information

**Current Model**: `gemini-pro`

**Why this model?**
- ✅ Stable and production-ready
- ✅ Available in all regions
- ✅ Works with free tier API keys
- ✅ Good balance of speed and quality
- ✅ Supports text generation up to 4096 tokens

**Alternative models** (if you want to try):
- `gemini-1.5-pro` - More powerful but slower
- `gemini-1.0-pro` - Older but very stable

To change the model, edit `lib/ai/gemini.ts` and update the default parameter.

---

## 🔑 API Key Check

Your current API key in `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyBRv8LZz9H4TNiF30MWL1Ycu4pS5DJPhaU"
```

If this key doesn't work:
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Replace the value in `.env.local`
4. Restart the dev server

---

## ✨ Ready to Test!

Everything is configured correctly. Just:
1. Clear cache: `rm -rf .next`
2. Restart: `npm run dev`
3. Test note generation!

The `gemini-pro` model should work without any 404 errors.
