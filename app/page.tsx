"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Send,
  Copy,
  Trash2,
  RefreshCw,
  Sparkles,
  Clock,
  ChevronDown,
} from "lucide-react";

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

// Verified Few-Shot examples (curated for the grid)
const EXAMPLES = [
  "007퍼스트라이트 가 뭐죠?",
  "일루미나티를 암시하는 것인가",
  "오 멋지네요",
  "안녕, 오늘도 좋은 하루 보냈어?",
  "이 프로젝트는 생각보다 일정이 촉박해서 걱정입니다.",
  "오늘 날씨가 정말 좋네요.",
  "휴먼-머스탱체가 그렇게 어렵진 않은데, 설명하기가 어렵네",
  "지적 감사하다면서 왜 반복하는데... 지적 감사합니다라고 해야지",
];

const MAX_HISTORY = 8;

export default function MustangToneConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [flash, setFlash] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mustang-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Persist history
  const persistHistory = (newHistory: HistoryItem[]) => {
    localStorage.setItem("mustang-history", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const triggerEntertainmentFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };

  const handleConvert = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("입력 문장을 작성해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "변환에 실패했습니다.");
        return;
      }

      const result = data.result as string;
      setOutput(result);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(36),
        input: trimmed,
        output: result,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
      persistHistory(newHistory);

      // Fun Mustang moment
      triggerEntertainmentFlash();
      toast.success("Eeeentertainment! 변환 완료!", {
        description: "머스탱 스타일로 가공되었습니다.",
        action: {
          label: "복사",
          onClick: () => handleCopy(result),
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.input);
    setOutput(item.output);
    toast("기록에서 불러왔습니다.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter((h) => h.id !== id);
    persistHistory(newHistory);
    toast("기록이 삭제되었습니다.");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    toast("입력과 결과가 초기화되었습니다.");
  };

  const clearHistory = () => {
    persistHistory([]);
    toast("모든 변환 기록이 삭제되었습니다.");
  };

  const useExample = (example: string) => {
    setInput(example);
    setOutput("");
    // Scroll to input
    const inputEl = document.getElementById("input-area");
    inputEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("예시 문장을 불러왔습니다. 변환하기 버튼을 눌러주세요.");
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-200">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#ff2e63]" />
              <div>
                <div className="font-bold tracking-[3px] text-xl">MUSTANG</div>
                <div className="text-[10px] text-zinc-500 -mt-1">MISSILIS ENTERTAINMENT</div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="ml-2 border-[#ff2e63]/60 text-[#ff2e63] cursor-pointer hover:bg-[#ff2e63]/10 transition"
              onClick={triggerEntertainmentFlash}
            >
              어투 변환기
            </Badge>
          </div>

          <button
            onClick={triggerEntertainmentFlash}
            className="text-sm font-mono tracking-[4px] text-[#ff2e63] hover:text-white transition flex items-center gap-1.5 group"
          >
            EEEENTERTAINMENT!
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition" />
          </button>
        </div>
      </header>

      {/* Flash Banner */}
      {flash && (
        <div className="entertainment-flash fixed inset-x-0 top-20 z-[60] flex justify-center pointer-events-none">
          <div className="bg-[#ff2e63] text-white px-8 py-2 rounded-full font-mono tracking-[6px] text-sm shadow-[0_0_40px_#ff2e63]">
            ★ EEEENTERTAINMENT! ★
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 pb-24 pt-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block mb-3">
            <Badge className="bg-[#ff2e63]/10 text-[#ff2e63] border-[#ff2e63]/30">THE GREATEST SHOWMAN IN THE ARK</Badge>
          </div>
          <h1 className="text-5xl font-bold tracking-[-1.5px] mb-3">
            머스탱 어투 변환기
          </h1>
          <p className="text-xl text-zinc-400">
            입력한 문장을 <span className="text-[#ff2e63]">독특하고 과장된</span> 엔터테인먼트 CEO 스타일로 가공합니다.
          </p>
        </div>

        {/* Input Section */}
        <div id="input-area" className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-sm font-medium text-zinc-400">입력 문장</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> 초기화
            </Button>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 오늘 날씨가 정말 좋네요."
            className="min-h-[140px] text-lg bg-zinc-950 border-white/10 focus-visible:border-[#ff2e63] focus-visible:ring-[#ff2e63]/30 resize-y"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleConvert();
              }
            }}
          />

          <div className="flex justify-end mt-3">
            <Button
              onClick={handleConvert}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="bg-[#ff2e63] hover:bg-[#ff2e63]/90 text-white font-semibold px-8 shadow-lg shadow-[#ff2e63]/30 active:scale-[0.985] transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  변환 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  변환하기
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output Section */}
        {output && (
          <Card className="mb-10 border-[#ff2e63]/40 bg-zinc-950/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ff2e63]" />
                변환 결과
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(output)}
                  className="border-white/15 hover:bg-white/5"
                >
                  <Copy className="w-4 h-4 mr-1.5" /> 복사
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOutput("")}
                  className="border-white/15 hover:bg-white/5"
                >
                  닫기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-[17px] leading-relaxed tracking-[-0.1px] text-white/90 whitespace-pre-wrap">
                {output}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="text-sm font-medium text-zinc-400">머스탱 예시 문장</div>
            <div className="text-[10px] text-zinc-600">(클릭하면 입력란에 채워집니다)</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => useExample(ex)}
                className="text-left px-4 py-3 rounded-xl border border-white/10 bg-zinc-950/60 hover:border-[#ff2e63]/40 hover:bg-zinc-900/60 active:bg-zinc-900 transition text-sm"
              >
                “{ex}”
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mt-2 px-1">
            위 예시는 검증된 Few-Shot 예시입니다. 실제 출력은 LLM에 따라 약간 달라질 수 있습니다.
          </p>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition"
            >
              <Clock className="w-4 h-4" />
              변환 기록 ({history.length}/{MAX_HISTORY})
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
              />
            </button>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> 전체 삭제
              </Button>
            )}
          </div>

          {showHistory && history.length > 0 && (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group border border-white/10 bg-zinc-950/50 rounded-2xl p-4 hover:border-white/20 transition"
                >
                  <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
                    <span>{formatTime(item.timestamp)}</span>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="opacity-40 hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-sm text-white/80 line-clamp-1 mb-2">
                    {item.input}
                  </div>
                  <div className="text-sm text-[#ff2e63]/90 font-medium line-clamp-1 mb-3">
                    {item.output}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => loadFromHistory(item)}
                    className="h-8 text-xs bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> 다시 사용하기
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showHistory && history.length === 0 && (
            <div className="text-center text-sm text-zinc-600 py-8 border border-white/10 rounded-2xl">
              아직 변환 기록이 없습니다.<br />첫 변환을 해보세요!
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center text-[12px] text-zinc-600">
          Powered by OpenAI Compatible API · 시스템 프롬프트는 절대 수정되지 않습니다.
          <br />
          <span className="text-[#ff2e63]/70">Eeeentertainment!</span>
        </div>
      </main>
    </div>
  );
}
