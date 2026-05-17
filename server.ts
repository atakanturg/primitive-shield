import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// A mock "Knowledge Base" (since we don't have pgvector in this environment)
// In a real application, this would be retrieved from Supabase pgvector
const MOCK_MIAMI_LAWS = `
Florida Chapter 83 & Miami-Dade Municipal Code (Excerpts):
1. **Notice of Termination (Month-to-Month):** Miami-Dade County requires landlords to give residential tenants at least 60 days' written notice before terminating a month-to-month tenancy (Ordinance No. 21-1). 
2. **Retaliatory Eviction:** It is unlawful for a landlord to discriminatorily increase a tenant's rent or decrease services, or to bring or threaten to bring an action for possession or other civil action, primarily because the landlord is retaliating against the tenant.
3. **Renovations & Repairs:** A landlord may not evict a tenant under the guise of "renovations" if the renovations are cosmetic or not immediately necessary for health and safety, without respecting the lease term or providing the mandatory 60-day notice for month-to-month tenancies in Miami-Dade.
4. **Self-Help Eviction:** Landlords cannot use "self-help" eviction methods (changing locks, shutting off utilities, removing doors) (Fla. Stat. 83.67). Eviction must go through the court process.
5. **Notice of Rent Increase:** Miami-Dade requires landlords to provide 60 days' written notice before increasing rent by more than 5%.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/analyze-notice", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document uploaded." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      // 1. Convert image to base64
      const base64Data = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;

      // 2. OCR and Demands Extraction
      console.log("Starting Phase 1: OCR & Demands Extraction");
      const extractResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { text: "Accurately transcribe the text of this document. Then, provide a concise summary of the landlord's core demands (e.g., 'give vacating date', 'pay extra fee', '7-day termination'). Output format: First the transcription, then 'DEMANDS SUMMARY:' followed by the summary." },
            { inlineData: { data: base64Data, mimeType: mimeType } }
          ]
        }
      });
      
      const ocrAndDemands = extractResponse.text;
      
      if (!ocrAndDemands) {
         throw new Error("Failed to extract text from document.");
      }

      // Memory Cleanup Phase: Drop base64 data to ensure no PII lingering
      req.file.buffer = Buffer.alloc(0);

      // 3. Triage & Analysis (RAG phase, using mock retrieved laws)
      console.log("Starting Phase 2: Legal Triage");
      
      const triagePrompt = `
You are a housing law evaluator assisting Miami-Dade tenants. 

DOCUMENT TEXT (OCR):
${ocrAndDemands}

RETRIEVED LOCAL LAWS (Miami-Dade / Florida):
${MOCK_MIAMI_LAWS}

EVALUATION CONSTRAINTS:
1. Determine the status of the document: 
   - 'illegible' if the text cannot be read or is completely unrelated to housing.
   - 'legal' if the notice appears to be a lawful demand (with proper notice periods respected).
   - 'predatory' if it contains illegal demands, violates notice periods, threatens illegal self-help, or implies an illegal rent increase based on provided retrieved laws.
2. If predatory, list specific flagged clauses from the text and cite which retrieved law it violates.
3. Output EXACTLY 8 actionable steps in 'action_plan'. 
   - If 'illegible', the steps should focus on how to take a better photo and why it's important to understand the document.
   - If 'legal', include actionable steps like preparing for relocation, contacting public free legal council, and understanding the moving timeline. 
   - If 'predatory', include steps for legal pushback, contacting legal aid, and documenting interactions.
4. Output a strictly formatted JSON response.
`;

      const triageResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: triagePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.STRING,
                description: "Must be exactly one of: 'illegible', 'legal', or 'predatory'."
              },
              summary_of_violations: {
                 type: Type.STRING,
                 description: "A short, plain-english summary of the situation."
              },
              flagged_clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    excerpt: { type: Type.STRING, description: "The exact quote from the document." },
                    law_violated: { type: Type.STRING, description: "The specific law from the context that it violates." },
                    explanation: { type: Type.STRING, description: "Brief explanation." }
                  },
                  required: ["excerpt", "law_violated", "explanation"]
                }
              },
              action_plan: {
                 type: Type.ARRAY,
                 items: { type: Type.STRING },
                 description: "Exactly 8 actionable steps explaining what the tenant should do next."
              }
            },
            required: ["status", "flagged_clauses", "action_plan", "summary_of_violations"]
          }
        }
      });

      const analysisRaw = triageResponse.text;
      let analysisJson;
      try {
        analysisJson = JSON.parse(analysisRaw!);
      } catch (e) {
         console.error("Failed to parse JSON response: ", analysisRaw);
         return res.status(500).json({ error: "Failed to generate legal analysis." });
      }

      res.json(analysisJson);

    } catch (error: any) {
      console.error("API Error: ", error);
      res.status(500).json({ error: error.message || "An error occurred during analysis." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
