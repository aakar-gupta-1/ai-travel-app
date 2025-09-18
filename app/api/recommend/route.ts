import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 🔄 UPDATED: 'travelStyles' is now expected to be an array of strings
  const { travelStyles, budget, customPrompt } = await req.json();

  // 🔄 UPDATED: Check if travelStyles is a non-empty array
  if (!travelStyles || travelStyles.length === 0 || !budget) {
    return NextResponse.json({ error: "Missing travelStyles or budget" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🔄 UPDATED: The prompt now joins the array of styles into a string
  const prompt = `
    You are a travel recommendation expert specializing in personalized itineraries.
    A user from India has specified their travel preferences:

    1.  **Desired Travel Styles:** "${travelStyles.join(', ')}"
    2.  **Maximum Budget per Person (in INR):** ₹${Number(budget).toLocaleString('en-IN')}
    3.  **Specific User Requirements:** "${customPrompt || 'None specified. Feel free to be creative.'}"

    Based on this combination of styles and requirements, recommend a single, specific travel destination (e.g., a city, national park, or region) that perfectly blends these interests.
    The recommended destination can be within India or international, but it must be realistically achievable within the given budget for a person traveling from India.

    Respond with ONLY a JSON object in the following format, with no other text or markdown:
    {
      "name": "Destination Name",
      "description": "A compelling, 2-3 sentence description of why this place is a great fit, referencing the user's desired styles, budget, and specific requirements.",
      "image": "a photographic search term for an image of this place"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendation = JSON.parse(jsonString);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get recommendation from AI" }, { status: 500 });
  }
}