import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchTerm } = await req.json();

  if (!searchTerm) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
     return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 });
  }

  // Construct the Unsplash API URL
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    searchTerm
  )}&per_page=1&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Find the URL of the first image result
    const imageUrl = data.results?.[0]?.urls?.regular;

    if (!imageUrl) {
      // Fallback if no image is found
      return NextResponse.json({ imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' });
    }

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch image from Unsplash" }, { status: 500 });
  }
}