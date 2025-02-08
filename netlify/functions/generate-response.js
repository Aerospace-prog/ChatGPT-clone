// netlify/functions/generate-response.js
import fetch from 'node-fetch';

export async function handler(event) {
    const API_KEY = process.env.API_KEY; // Access environment variable
    const { prompt } = JSON.parse(event.body); // Get user input from request body

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

        if (!response.ok) throw new Error('Failed to fetch AI response');

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ response: data.candidates[0].content.parts[0].text }),
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}