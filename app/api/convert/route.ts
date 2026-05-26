import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/mustangPrompt";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Basic validation
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "입력 문장이 필요합니다." },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: "입력 문장이 비어 있습니다." },
        { status: 400 }
      );
    }
    if (trimmed.length > 800) {
      return NextResponse.json(
        { error: "입력 문장이 너무 깁니다 (최대 800자)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const result = completion.choices[0]?.message?.content?.trim();

    if (!result) {
      return NextResponse.json(
        { error: "LLM에서 응답을 받지 못했습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Convert API error:", error);

    // Handle common OpenAI/compatible errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API 키가 유효하지 않습니다. OPENAI_API_KEY를 확인하세요." },
        { status: 401 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "변환 중 오류가 발생했습니다. 잠시 후 다시 시도하세요." },
      { status: 500 }
    );
  }
}
