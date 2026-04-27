# 🧪 Quick Test Guide - PDF Merger

## Before You Demo Tomorrow

Run through this quick test to make sure everything works:

---

## ✅ Pre-Test Setup (2 minutes)

### 1. Make Sure You Have PDF Files

You need at least 2 PDF files uploaded to your modules.

**If you don't have any:**
1. Go to http://localhost:3000/modules
2. Click on any module
3. Click "New Note" → Upload a PDF file
4. Repeat for at least 2 PDFs (can be the same file twice)

**Quick tip**: Use any lecture slides or sample PDFs you have.

---

## 🧪 Test Checklist (5 minutes)

### Test 1: Page Loads ✅
1. Go to http://localhost:3000/merge
2. **Expected**: Page loads without errors
3. **Expected**: Two cards appear (Available Files | Selected Files)

### Test 2: Files Load ✅
1. Look at the "Available PDF Files" card
2. **Expected**: Your uploaded PDFs appear in the list
3. **Expected**: Each file shows module code and filename
4. **Expected**: PDF icon (red) appears next to each file

### Test 3: Select Files ✅
1. Check the box next to 2 or more PDFs
2. **Expected**: Files appear in "Selected Files" panel
3. **Expected**: Page count shows for each file
4. **Expected**: Total pages shows at bottom

### Test 4: Reorder Files ✅
1. Click the ↑ arrow on the second file
2. **Expected**: File moves up one position
3. Click the ↓ arrow
4. **Expected**: File moves down one position

### Test 5: Remove File ✅
1. Click the X button on any selected file
2. **Expected**: File disappears from selected list
3. **Expected**: Checkbox in available list unchecks
4. Add it back by checking the box again

### Test 6: Merge PDFs ✅
1. Make sure you have at least 2 files selected
2. Click "Merge X PDFs" button
3. **Expected**: Button shows "Merging X files..." with spinner
4. **Expected**: After a few seconds, "Download Merged PDF" button appears
5. **Expected**: Success toast notification appears

### Test 7: Download ✅
1. Click "Download Merged PDF" button
2. **Expected**: File downloads to your Downloads folder
3. **Expected**: Filename is `merged_YYYY-MM-DD-HH-MM-SS.pdf`
4. Open the downloaded PDF
5. **Expected**: All pages from all selected files are present
6. **Expected**: Pages are in the order you arranged them

---

## 🎯 Quick Smoke Test (1 minute)

If you're short on time, just do this:

1. Go to /merge
2. Select 2 PDFs
3. Click Merge
4. Click Download
5. Open the file

**If all 5 steps work, you're good to go!**

---

## 🐛 Common Issues & Fixes

### Issue: No files showing up
**Fix**: Upload some PDF files to your modules first

### Issue: "Select at least 2 files" error
**Fix**: Check the boxes next to at least 2 files

### Issue: Merge button is disabled
**Fix**: Make sure you have 2+ files selected

### Issue: Merge fails with error
**Possible causes**:
- Corrupted PDF file
- Very large PDF (>50MB)
- Browser memory issue

**Fix**: Try with smaller, simpler PDFs first

### Issue: Download doesn't start
**Fix**: 
- Check browser's download settings
- Allow downloads from localhost
- Try a different browser

---

## 📊 What to Check in the Downloaded PDF

Open the merged PDF and verify:

1. ✅ **Page count is correct**
   - Count pages in each source file
   - Add them up
   - Compare to merged file

2. ✅ **Order is correct**
   - First file's pages come first
   - Second file's pages come second
   - Etc.

3. ✅ **Content is intact**
   - Text is readable
   - Images are visible
   - No blank pages (unless source had them)

4. ✅ **Quality is good**
   - No pixelation
   - No compression artifacts
   - Same quality as source files

---

## 🚨 Red Flags (Stop and Fix)

If any of these happen, **don't demo until fixed**:

- ❌ Page doesn't load at all
- ❌ No files appear (and you know you uploaded some)
- ❌ Merge fails every time
- ❌ Downloaded PDF is corrupted
- ❌ Pages are missing from merged PDF
- ❌ Console shows errors

**If you see any red flags, let me know and I'll help fix them!**

---

## ✅ Green Lights (You're Ready!)

If all of these work, **you're ready to demo**:

- ✅ Page loads cleanly
- ✅ Files appear in the list
- ✅ Selection works
- ✅ Reordering works
- ✅ Merge completes successfully
- ✅ Download works
- ✅ Merged PDF opens and looks correct

---

## 🎬 Final Pre-Demo Check (Tomorrow Morning)

30 minutes before your demo:

1. [ ] Start dev server: `npm run dev`
2. [ ] Open http://localhost:3000/merge
3. [ ] Run the Quick Smoke Test (1 minute)
4. [ ] Keep the browser tab open
5. [ ] Have a backup PDF ready (in case you need to re-upload)

---

## 💡 Pro Tips

### Tip 1: Use Real Lecture Slides
Demo with actual polytechnic lecture slides if you have them. Makes it more relatable.

### Tip 2: Pre-Select Files
Before the demo, have 2-3 files already selected. Saves time during the demo.

### Tip 3: Know Your Numbers
"This merges 3 files with 45 total pages in about 2 seconds" sounds more impressive than "it's fast."

### Tip 4: Have a Backup
If the live demo fails, have a pre-merged PDF ready to show. Or show the code.

### Tip 5: Practice Once
Run through the demo once tonight. Time yourself. Aim for under 2 minutes.

---

## 🎉 You're All Set!

Run through this test checklist, fix any issues, and you'll be ready for a smooth demo tomorrow.

**The feature works great - just make sure you've tested it once before showing it off!**

Good luck! 🚀
