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
  const base64Data = imageUrl.replace(/^data:[^;]+;base64,/, "");
  return { mimeType, base64Data };
}

function isPDF(imageUrl: string): boolean {
  if (!imageUrl) return false;
  if (imageUrl.startsWith("data:application/pdf;base64,")) {
    return true;
  }
  const clean = imageUrl.replace(/^data:[^;]+;base64,/, "");
  if (clean.startsWith("JVBERi")) {
    return true;
  }
  return false;
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

    // Read headers and body
    const reqBody = await request.json();
    const { imageUrl, language = "English" } = reqBody;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image/document data provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key is not configured on Cloudflare." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const pdfDetected = isPDF(imageUrl);
    const triagePrompt = `
You are a housing law evaluator assisting Miami-Dade tenants protect their rights.
CRITICAL INSTRUCTION: You MUST translate ALL output into ${language}. The entire JSON response (summary, clauses, action plan) must be in ${language}.

${pdfDetected ? "Analyze the following notice document and evaluate it against our laws and resources:" : "Analyze the uploaded document image and evaluate it against the following local laws and resources:"}

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

    const { mimeType, base64Data } = parseBase64Image(imageUrl);

    const contents = [
      {
        role: "user",
        parts: [
          { text: triagePrompt },
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
      return new Response(JSON.stringify({ error: `Gemini API error: ${errorText}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const geminiResult = await response.json();
    const analysisRaw = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!analysisRaw) {
      return new Response(JSON.stringify({ error: "No response content from Gemini." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(analysisRaw, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "An error occurred during analysis." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
