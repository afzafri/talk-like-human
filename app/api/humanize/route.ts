import { NextRequest, NextResponse } from "next/server";
import { createProvider } from "@/lib/llm";
import { loadSkill, buildSystemPrompt } from "@/lib/skillLoader";

const MAX_INPUT_LENGTH = 3000;

export async function POST(req: NextRequest) {
  let body: { text?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    const skillContent = await loadSkill();
    const systemPrompt = buildSystemPrompt(skillContent);
    const provider = createProvider();
    const result = await provider.generate(systemPrompt, text);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/humanize] Error:", err);
    return NextResponse.json(
      { error: "Failed to humanize text. Please try again." },
      { status: 500 }
    );
  }
}
