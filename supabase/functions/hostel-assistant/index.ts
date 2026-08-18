const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are HostelHub Assistant — a strictly domain-specific AI helper for the HostelHub student accommodation platform (primarily India, prices in INR ₹).

SCOPE — ONLY answer questions about HostelHub and student accommodation, including:
- Finding hostels / PGs
- Booking rooms, booking status, cancellations, refunds, minimum stay
- Room availability and occupancy
- Hostel facilities
- Rent, pricing and payments
- Hostel rules and policies
- Owner information
- Nearby colleges, distances, maps and directions
- Reviews and ratings
- Student support and account management
- HostelHub navigation

OUT OF SCOPE:
Do not answer general knowledge, coding, politics, entertainment, sports, news, personal advice, or unrelated questions.

For out-of-scope requests, reply exactly:
"I'm the HostelHub Assistant. I can only help with HostelHub services, hostel bookings, rooms, PGs, facilities, payments, owners, locations, and accommodation-related questions."

DATA HONESTY:
- Never invent hostel names, prices, availability, owners, phone numbers, addresses or ratings.
- If live HostelHub data cannot be verified, say:
"I couldn't find that information in HostelHub. Please contact the hostel owner or HostelHub support."

STYLE:
- Friendly, professional and concise.
- Use ₹ for prices.
- Use Indian context by default.
- Stay focused on HostelHub and student accommodation.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    console.log("Gemini API key exists:", !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.error("Gemini API error:", response.status, text);

      return new Response(
        JSON.stringify({
          error: "Gemini API error",
          detail: text,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("HOSTEL ASSISTANT ERROR:", error);

    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});