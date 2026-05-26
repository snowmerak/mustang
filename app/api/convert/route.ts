import { NextRequest, NextResponse } from "next/server";
import ky, { HTTPError } from "ky";
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
    const rawBaseURL = process.env.OPENAI_BASE_URL;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // Clean base URL (remove trailing slash)
    const baseURL = (rawBaseURL || "https://api.openai.com/v1").replace(/\/+$/, "");

    // 디버깅용 로그 (개발 시 도움이 됨)
    console.log("[Convert API] Using config:", {
      baseURL,
      model,
      hasApiKey: !!apiKey,
      keyPreview: apiKey ? apiKey.slice(0, 8) + "..." : "none",
    });

    if (!apiKey) {
      // Ollama 등 로컬 서버는 키가 없어도 동작하는 경우가 많음
      // 하지만 Authorization 헤더는 빈 값으로 보내지 않도록 처리
      console.warn("[Convert API] OPENAI_API_KEY is not set. Proceeding without Authorization header.");
    }

    console.log("[Convert API] Sending request to LM Studio / local server...");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    try {
      const completion = await ky
        .post(`${baseURL}/chat/completions`, {
          headers,
          json: {
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: trimmed },
            ],
            temperature: 0.8,
            max_tokens: 300,
          },
          timeout: 120000, // LM Studio는 응답이 느릴 수 있음
        })
        .json<any>();

      const result = completion?.choices?.[0]?.message?.content?.trim();

      if (!result) {
        return NextResponse.json(
          { error: "LLM에서 응답을 받지 못했습니다." },
          { status: 502 }
        );
      }

      return NextResponse.json({ result });
    } catch (err) {
      if (err instanceof HTTPError) {
        const status = err.response.status;
        const errorBody = await err.response.text().catch(() => "");

        console.error("LM Studio / LLM API error:", {
          status,
          body: errorBody,
        });

        if (status === 401) {
          return NextResponse.json(
            { error: "API 키가 유효하지 않습니다. OPENAI_API_KEY를 확인하세요." },
            { status: 401 }
          );
        }
        if (status === 429) {
          return NextResponse.json(
            { error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `LLM API 오류 (${status})` },
          { status: 502 }
        );
      }

      // 네트워크 오류 (LM Studio가 꺼져있거나 연결 실패)
      console.error("LM Studio connection error:", err);
      return NextResponse.json(
        { error: "LM Studio에 연결할 수 없습니다. 서버가 실행 중인지, Base URL이 올바른지 확인하세요." },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Convert API error:", error);

    // Network or unexpected errors
    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: "LLM 서버에 연결할 수 없습니다. Base URL과 네트워크를 확인하세요." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "변환 중 오류가 발생했습니다. 잠시 후 다시 시도하세요." },
      { status: 500 }
    );
  }
}
