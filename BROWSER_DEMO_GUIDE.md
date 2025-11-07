# 🚀 ExportRemix - Browser Demo Guide

## To Start the Server:

### Windows:
1. Double-click `start-server.bat` OR
2. Open PowerShell/Terminal in this folder and run:
   ```powershell
   npm install
   npm run dev
   ```
   OR if you have pnpm:
   ```powershell
   pnpm install
   pnpm dev
   ```

### Mac/Linux:
```bash
npm install
npm run dev
```

## Once Server is Running:

### 1. Navigate to Back Office
**URL**: http://localhost:3000/dashboard/back-office

### 2. What You'll See:

#### **Header Section**
- Title: "Back Office - Manifest Entry"
- Subtitle: "Enter or upload manifest data for compliance checking"

#### **File Upload Card**
- "Browse Files" button (black background, white text)
- Upload XML manifest files
- Shows missing fields alert if form incomplete

#### **Manifest Form**
- **Description** field (required)
- **HS Code** field with "Suggest HS" button (sparkles icon)
- **Quantity** field (required)
- **Unit of Measure** field
- **Value (USD)** field (required)
- **Weight (kg)** field
- **Origin** field (required)
- **Destination** field (required)

#### **Tariff Estimation Card**
- "Estimate Duty" button
- Shows tariff rate percentage
- Shows estimated duty amount

#### **Compliance Testing Card**
- "Test Compliance" button
- Shows compliance score (0-100) with progress bar
- "Fix Errors" button appears if score < 100

#### **Compliance Breakdown Card**
- Field-by-field validation status
- List of errors with severity levels

#### **Incoterms Recommendation Card**
- "Suggest Best Incoterm" button
- Shows recommended term with confidence %
- Risk and cost analysis
- Alternative options

#### **Country-Specific Regulations Card**
- "Check Regulations" button
- Shows alerts for bans, restrictions, licenses
- De minimis threshold information

#### **Fixed Manifest Actions** (after fixing errors)
- Download XML button
- Retest button
- Shows fixed manifest ready message

## 🧪 Test Flow:

1. **Upload Sample XML**:
   ```xml
   <manifest>
     <item 
       description="Electronic Components" 
       origin="CN" 
       destination="US" 
       quantity="500" 
       value="5000"
       hsCode="847130"
     />
   </manifest>
   ```

2. **Click "Suggest HS"** → See top 3 HS code suggestions

3. **Click "Estimate Duty"** → See tariff rate and estimated duty

4. **Click "Test Compliance"** → See score and breakdown

5. **If score < 100, click "Fix Errors"** → AI fixes issues

6. **Click "Retest"** → Should achieve 10/10 score

7. **Click "Download XML"** → Download corrected manifest

## 🎨 UI Features:

- ✅ Modern shadcn/ui components
- ✅ Loading states on all buttons
- ✅ Toast notifications for actions
- ✅ Color-coded badges (green=good, red=error)
- ✅ Progress bars for scores
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support (via theme toggle)

## 📸 Expected Visual Layout:

```
┌─────────────────────────────────────────┐
│  Back Office - Manifest Entry           │
│  Enter or upload manifest data...       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Upload XML Manifest                    │
│  [Browse Files] [Missing: Description]  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Manifest Details                       │
│  Description: [________]                │
│  HS Code: [____] [Suggest HS]           │
│  Quantity: [____] UOM: [____]            │
│  Value: [____] Weight: [____]            │
│  Origin: [____] Destination: [____]    │
└─────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐
│ Tariff Est.  │  │ Compliance   │
│ [Estimate]   │  │ [Test]       │
│ Rate: 5%     │  │ Score: 85/100│
└──────────────┘  └──────────────┘

┌─────────────────────────────────────────┐
│  Incoterms Recommendation               │
│  [Suggest Best Incoterm]                │
│  Recommended: DDP (95% confidence)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Country-Specific Regulations           │
│  [Check Regulations]                    │
│  ⚠️ 2 alerts found                      │
└─────────────────────────────────────────┘
```

## 🔑 Required Setup:

Before running, create `.env.local`:
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## ✨ Key Features Demonstrated:

1. **AI-Powered**: All suggestions use GPT-4o
2. **Real-time Validation**: Instant feedback
3. **Auto-Fix**: AI corrects errors automatically
4. **Compliance Scoring**: 0-100 with breakdown
5. **Country Intelligence**: Alerts for regulations
6. **Incoterms Guidance**: Best term recommendations

---

**Ready to test!** Start the server and navigate to `/dashboard/back-office`

