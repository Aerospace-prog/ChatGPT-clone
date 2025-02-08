export async function handler(event) {
    const API_KEY = process.env.API_KEY; // Access environment variable
    const { prompt } = JSON.parse(event.body); // Get user input from request body

    console.log("API_KEY:", API_KEY); // Debug API key
    console.log("Prompt received:", prompt); // Debug prompt

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }),
        });

        console.log("API Response:", response.status); // Debug response status

        if (!response.ok) throw new Error(`Failed to fetch AI response. Status: ${response.status}`);

        const data = await response.json();
        console.log("Response Data:", data); // Debug response data

        return {
            statusCode: 200,
            body: JSON.stringify({ response: data.candidates[0].content.parts[0].text }),
        };
    } catch (error) {
        console.error("Error:", error.message); // Debug error
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};