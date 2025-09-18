import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { destinationName, travelStyles, budget, numPeople, customPrompt } = await req.json();

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🔄 UPDATED PROMPT: Removed "3-day" constraint. AI now determines the optimal trip duration.
  const prompt = `
    You are an expert travel planner. Create the best possible, detailed itinerary for a group of ${numPeople} people traveling to ${destinationName}.

    Their travel profile is as follows:
    - **Total Budget for the Group:** ₹${Number(budget).toLocaleString('en-IN')}. This budget must cover reasonable accommodation, activities, and food for the entire trip.
    - **Desired Vibe/Styles:** ${travelStyles.join(', ')}
    - **Other User Notes:** "${customPrompt || 'None'}"

    Crucially, you must determine the optimal duration (number of days) for the trip based on the destination and the provided budget. The goal is to create the most fulfilling experience possible without exceeding the budget. State the recommended duration clearly at the beginning of the itinerary.

    The itinerary should be practical and inspiring. Include a mix of activities, potential dining spots, and logistical tips. The tone should be exciting and helpful.

    Format the response as a single block of text. Use markdown for headings (e.g., '## Day 1: Arrival and Exploration') and bullet points for activities. Do not wrap the response in a JSON object or markdown code block.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const itineraryText = response.text();

    return NextResponse.json({ itinerary: itineraryText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}