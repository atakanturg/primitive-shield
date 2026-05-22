import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import dotenv from "dotenv";
import { createRequire } from "module";
const pdfParse = createRequire(import.meta.url)("pdf-parse");

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const MIAMI_LAWS = `
FLORIDA LANDLORD-TENANT LAW (Chapter 83, Florida Statutes — https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0083/0083.html):
1. Fla. Stat. 83.46 — Rent; duration of tenancies: Rent is due at the time and place agreed upon. If no agreement, it is due at the beginning of each period.
2. Fla. Stat. 83.49 — Deposit money or advance rent; duty of landlord and tenant: Landlords must return security deposits within 15 days of termination of the tenancy, or provide written notice of claim within 30 days.
3. Fla. Stat. 83.51 — Landlord's obligation to maintain premises: Landlords must maintain premises in a structurally sound condition, comply with housing codes affecting health and safety, and ensure all plumbing, electrical, and HVAC systems are in working order.
4. Fla. Stat. 83.56 — Termination of rental agreement: Before eviction, a landlord must serve a proper written notice (3 days for non-payment of rent; 7 days for lease violations). Failure to follow exact legal procedure voids the eviction claim.
5. Fla. Stat. 83.60 — Defenses to action for rent or possession: Tenants may withhold rent or defend against eviction if the landlord fails to maintain the premises or violates tenant rights.
6. Fla. Stat. 83.64 — Retaliatory conduct: It is UNLAWFUL for a landlord to increase rent, decrease services, or threaten eviction in retaliation for a tenant reporting code violations or exercising legal rights.
7. Fla. Stat. 83.67 — Prohibited practices: Landlords CANNOT change locks, shut off utilities, remove doors/windows, or use any self-help eviction method. Doing so entitles the tenant to sue for 3 months' rent or actual damages, whichever is greater.
8. Miami-Dade County Ordinance No. 21-1 — Requires landlords to give tenants at least 60 days written notice before terminating a month-to-month tenancy and at least 60 days notice before raising rent by more than 5%.

FAIR HOUSING ACT (https://www.justice.gov/crt/fair-housing-act-1):
- It is illegal to evict or discriminate based on race, color, national origin, religion, sex, familial status, or disability.
- Predatory eviction patterns targeting protected classes constitute federal civil rights violations.

FLORIDA COURTS EVICTION FORMS (official resources):
- Landlord/Tenant Forms: https://flcourts-media.flcourts.gov/content/download/241621/file/92023a3.pdf
- Answer to Eviction Complaint Form (tenant defense filing): https://www-media.floridabar.org/uploads/2024/08/Form-1.947b-Answer-Residential-Eviction.pdf
`;

const FREE_LEGAL_RESOURCES = `
Miami-Dade Free Legal Resources:
- Legal Services of Greater Miami: (305) 579-5733 | lsgmi.org — Free civil legal aid for low-income residents.
- Community Legal Services: (305) 751-0232 — Housing and eviction defense.
- Florida Rural Legal Services: (800) 277-7680 — Free housing legal help.
- Dade County Bar Association Lawyer Referral: (305) 371-2202
- Miami-Dade Tenant Hotline: 311
- Florida Bar Find a Lawyer: floridabar.org/public/directory
- File your Answer to Eviction here: https://www-media.floridabar.org/uploads/2024/08/Form-1.947b-Answer-Residential-Eviction.pdf
`;

const RELOCATION_AREAS = `
Affordable Relocation Areas in Miami-Dade & Surrounding Counties:
- Hialeah: Historically one of Miami-Dade's most affordable neighborhoods, strong Cuban-American community.
- Homestead / Florida City: Southern Miami-Dade, significantly lower rents, suburban feel.
- North Miami / North Miami Beach: Mid-range pricing, closer to the city.
- Miami Gardens: Predominantly residential, lower cost of living than Miami proper.
- Broward County (Lauderhill, Lauderdale Lakes, Miramar): 20-40 min north, substantially lower rents.
- Palm Beach County (Lake Worth, Boynton Beach): Further north, excellent affordability.
- Section 8 / HUD Housing: Miami-Dade Public Housing Agency (786) 654-7100 | miamidade.gov/housing
- Emergency Rental Assistance: Camillus House (305) 374-1065 | Salvation Army Miami (305) 325-8370
`;

function parseBase64Image(imageUrl: string): { mimeType: string; base64Data: string } {
  let mimeType = "image/jpeg";
  if (imageUrl.startsWith("data:")) {
    try {
      const match = imageUrl.match(/^data:([^;]+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    } catch {}
  }
  // Bulletproof strip of any data URI prefix
  const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
  return { mimeType, base64Data };
}

function isPDF(imageUrl: string, contentType?: string): boolean {
  if (!imageUrl) return false;
  if (contentType && contentType.toLowerCase().includes("application/pdf")) {
    return true;
  }
  if (imageUrl.startsWith("data:application/pdf;base64,")) {
    return true;
  }
  // Strip URI schema and check magic number (JVBERi represents %PDF)
  const clean = imageUrl.replace(/^data:[^;]+;base64,/, "");
  if (clean.startsWith("JVBERi")) {
    return true;
  }
  if (imageUrl.toLowerCase().split('?')[0].endsWith(".pdf")) {
    return true;
  }
  return false;
}

async function extractTextFromPDF(imageUrl: string): Promise<string> {
  let pdfBuffer: Buffer;
  if (imageUrl.startsWith("http:") || imageUrl.startsWith("https:")) {
    console.log("Fetching PDF from URL:", imageUrl);
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    pdfBuffer = Buffer.from(arrayBuffer);
  } else {
    // Base64 string
    const cleanBase64 = imageUrl.replace(/^data:[^;]+;base64,/, "");
    pdfBuffer = Buffer.from(cleanBase64, "base64");
  }
  const parsedData = await pdfParse(pdfBuffer);
  return parsedData.text || "";
}

async function getGeminiPart(imageUrl: string): Promise<any> {
  if (!imageUrl) {
    throw new Error("No image data provided to AI parser.");
  }
  if (imageUrl.startsWith("http:") || imageUrl.startsWith("https:")) {
    console.log("Fetching image from public URL:", imageUrl);
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const base64Data = Buffer.from(buffer).toString("base64");
    console.log("Fetched image successfully, length:", base64Data.length);
    return {
      inlineData: {
        mimeType,
        data: base64Data
      }
    };
  } else {
    const { mimeType, base64Data } = parseBase64Image(imageUrl);
    console.log("Parsed Base64 Image - Mime:", mimeType, "Length:", base64Data.length);
    if (!base64Data || base64Data.length === 0) {
      throw new Error("Base64 image data is empty or invalid.");
    }
    return {
      inlineData: {
        mimeType,
        data: base64Data
      }
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/analyze-notice", async (req, res) => {
    try {
      const { imageUrl, language = 'English' } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "No image/document data provided." });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const pdfDetected = isPDF(imageUrl);
      let extractedText = "";

      if (pdfDetected) {
        console.log("PDF notice detected! Extracting text contents server-side...");
        try {
          extractedText = await extractTextFromPDF(imageUrl);
          console.log(`Successfully extracted ${extractedText.length} characters of text from PDF notice.`);
        } catch (pdfErr: any) {
          console.error("Failed to parse PDF text:", pdfErr);
          throw new Error(`Failed to extract text from PDF notice: ${pdfErr.message}`);
        }
      }

      console.log(`Starting Gemini Notice Analysis (${language}, Mode: ${pdfDetected ? "PDF Text" : "Multimodal Vision"})...`);

      const triagePrompt = `
You are a housing law evaluator assisting Miami-Dade tenants protect their rights.
CRITICAL INSTRUCTION: You MUST translate ALL output into ${language}. The entire JSON response (summary, clauses, action plan) must be in ${language}.

${pdfDetected ? `Analyze the following extracted notice document text and evaluate it against our laws and resources:\n\nDOCUMENT TEXT CONTENT:\n"""\n${extractedText}\n"""` : "Analyze the uploaded document image and evaluate it against the following local laws and resources:"}

MIAMI-DADE LAWS:
${MIAMI_LAWS}

FREE LEGAL RESOURCES:
${FREE_LEGAL_RESOURCES}

RELOCATION RESOURCES:
${RELOCATION_AREAS}

INSTRUCTIONS:
Determine the document status — it must be exactly one of three values:

PATH 1 — "illegible":
Use this if the document text cannot be read clearly, the image is too blurry/dark, or the content is completely unrelated to housing or tenancy. (If we parsed the PDF successfully and found text, status should almost never be "illegible" unless the text itself is completely blank or gibberish).
Action plan for illegible: The model should say re-upload. Provide 8 steps focusing on how to re-upload a clearer image. Steps should include: ensuring good lighting, flattening the document, using a scanner app, checking focus, capturing the entire page, why clarity is needed for legal review, trying a different file format (PDF), and attempting to re-upload.

PATH 2 — "legal":
Use this if the notice appears to follow lawful procedures with proper notice periods respected and no illegal clauses.
Action plan for legal: Provide 8 concrete actionable steps. MUST include:
- Actionable steps for next moves.
- Specific potential areas for relocation from the RELOCATION RESOURCES list.
- Contact information for public free legal council from the FREE LEGAL RESOURCES list.

PATH 3 — "predatory":
Use this if the notice contains illegal demands, insufficient notice periods, threatens self-help eviction, implies illegal rent increases, or is retaliatory.
Action plan for predatory: Provide 8 concrete actionable steps. MUST include:
- Actionable steps for defending against the predatory notice.
- Specific potential areas for relocation from the RELOCATION RESOURCES list (in case they need to move safely).
- Contact information for public free legal council from the FREE LEGAL RESOURCES list.

OUTPUT FORMAT — Return ONLY a valid JSON object, no markdown formatting, no code blocks:
{
  "status": "illegible" | "legal" | "predatory",
  "summary_of_violations": "2-3 sentence plain-english summary of the situation and what was found. If illegible, say re-upload.",
  "flagged_clauses": [
    {
      "excerpt": "Exact quote from the document",
      "law_violated": "Specific law or statute it violates",
      "explanation": "Brief explanation of why this is a violation"
    }
  ],
  "action_plan": [
    "Step 1 — detailed actionable instruction",
    "Step 2 — detailed actionable instruction",
    "Step 3 — detailed actionable instruction",
    "Step 4 — detailed actionable instruction",
    "Step 5 — detailed actionable instruction",
    "Step 6 — detailed actionable instruction",
    "Step 7 — detailed actionable instruction",
    "Step 8 — detailed actionable instruction"
  ]
}

There must be EXACTLY 8 items in action_plan. flagged_clauses should be empty array [] if status is "illegible" or "legal".
`;

      let contents;
      if (pdfDetected) {
        contents = [
          {
            role: "user",
            parts: [
              { text: triagePrompt }
            ]
          }
        ];
      } else {
        const imagePart = await getGeminiPart(imageUrl);
        contents = [
          {
            role: "user",
            parts: [
              { text: triagePrompt },
              imagePart
            ]
          }
        ];
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const geminiResult = await response.json();
      const analysisRaw = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!analysisRaw) throw new Error("No response content from Gemini.");

      let analysisJson;
      try {
        analysisJson = JSON.parse(analysisRaw);
      } catch (e) {
        console.error("Failed to parse Gemini JSON:", analysisRaw);
        return res.status(500).json({ error: "Failed to parse analysis response." });
      }

      res.json(analysisJson);
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during analysis." });
    }
  });

  app.post("/api/chat-notice", async (req, res) => {
    try {
      const { imageUrl, messages, language = 'English' } = req.body;
      
      if (!imageUrl || !messages) {
        return res.status(400).json({ error: "Missing image URL or messages." });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const pdfDetected = isPDF(imageUrl);
      let extractedText = "";

      if (pdfDetected) {
        console.log("PDF notice detected in chat! Extracting text contents server-side...");
        try {
          extractedText = await extractTextFromPDF(imageUrl);
        } catch (pdfErr: any) {
          console.error("Failed to parse PDF text in chat:", pdfErr);
        }
      }

      console.log(`Starting Gemini Chat Analysis (${language}, Mode: ${pdfDetected ? "PDF Text" : "Multimodal Vision"})...`);

      const systemPrompt = `
You are a tenant rights legal assistant for Miami-Dade County. The user has uploaded an eviction notice.
You must answer their questions directly, specifically citing Florida Chapter 83 and Miami-Dade Municipal Code where relevant.
Do NOT give definitive legal advice, just informational guidance.
CRITICAL INSTRUCTION: You MUST reply in ${language}.

MIAMI-DADE LAWS:
${MIAMI_LAWS}

FREE LEGAL RESOURCES:
${FREE_LEGAL_RESOURCES}
`;

      const formattedHistory = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      let contents;
      if (pdfDetected) {
        contents = [
          {
            role: "user",
            parts: [
              { text: `Here is the text content extracted from the uploaded PDF notice that we are discussing:\n\nDOCUMENT TEXT CONTENT:\n\"\"\"\n${extractedText}\n\"\"\"` }
            ]
          },
          ...formattedHistory
        ];
      } else {
        const imagePart = await getGeminiPart(imageUrl);
        contents = [
          {
            role: "user",
            parts: [
              { text: "Here is the document image we are discussing:" },
              imagePart
            ]
          },
          ...formattedHistory
        ];
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini Chat API error:", errorText);
        throw new Error(`Gemini Chat API error ${response.status}: ${errorText}`);
      }

      const geminiResult = await response.json();
      const answer = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answer) throw new Error("No response content from Gemini.");

      res.json({ answer });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Primitive Shield running on http://localhost:${PORT}`);
  });
}

startServer();
