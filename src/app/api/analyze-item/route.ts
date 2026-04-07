import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { imageUrl } = await request.json();

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `Analyze this clothing item and respond with ONLY valid JSON in this exact format:
{
  "name": "short name for the item",
  "category": "one of: tops, bottoms, shoes, outerwear, accessories, dresses",
  "color": "primary color(s)",
  "style": "style vibe e.g. casual, smart-casual, formal, streetwear, bohemian",
  "description": "2-3 sentences describing the item, what occasions it works for, and how versatile it is"
}`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw: text }, { status: 500 });
  }
}
