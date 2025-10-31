export async function handler(event) {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("Missing API_KEY");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API_KEY not set in environment" }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt in request body" }),
      };
    }

    console.log("Prompt received:", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("API Response:", response.status, data);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "Failed to fetch AI response",
        }),
      };
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text available";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: text }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
