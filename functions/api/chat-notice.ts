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

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

    // Read body
    const reqBody = await request.json();
    const { imageUrl, messages, language = "English" } = reqBody;

    if (!imageUrl || !messages) {
      return new Response(JSON.stringify({ error: "Missing image URL or messages." }), {
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

    const { mimeType, base64Data } = parseBase64Image(imageUrl);

    const contents = [
      {
        role: "user",
        parts: [
          { text: "Here is the document notice we are discussing:" },
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      },
      ...formattedHistory
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
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
    const answer = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) {
      return new Response(JSON.stringify({ error: "No response content from Gemini." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "An error occurred during chat." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
