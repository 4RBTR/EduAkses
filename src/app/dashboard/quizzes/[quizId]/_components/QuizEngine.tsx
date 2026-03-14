"use client";

import { useState, useEffect, useTransition } from "react";
import { getNextQuestion, verifyAnswer, submitQuizScore, NextQuestionResult, Difficulty } from "@/app/actions/quiz";
import { Loader2, ArrowRight, BrainCircuit, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuizEngineProps {
  quizId: string;
  quizTitle: string;
}

export function QuizEngine({ quizId, quizTitle }: QuizEngineProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState<NextQuestionResult | null>(null);
  
  // Quiz State
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [wasCorrectLastTime, setWasCorrectLastTime] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  // UI State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(true);

  // Initialize Quiz
  useEffect(() => {
    fetchNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNext = async (currentAnsweredIds?: string[]) => {
    setIsLoadingNext(true);
    setQuestion(null); // Clear previous question
    setSelectedOption(null);
    setFeedback(null);
    
    try {
      const ids = currentAnsweredIds || answeredIds;
      const result = await getNextQuestion(quizId, currentDifficulty, wasCorrectLastTime, ids);
      if (result && result.isFinished) {
        setIsFinished(true);
      } else if (result) {
        setQuestion(result);
        setCurrentDifficulty(result.difficulty);
      }
    } catch (error) {
      console.error("Failed to fetch next question:", error);
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || !question) return;

    startTransition(async () => {
      try {
        const isCorrect = await verifyAnswer(question.id, selectedOption);
        setFeedback(isCorrect ? "correct" : "incorrect");
        setWasCorrectLastTime(isCorrect);
        
        // Calculate points based on difficulty
        let points = 0;
        if (isCorrect) {
          if (question.difficulty === "EASY") points = 10;
          if (question.difficulty === "MEDIUM") points = 20;
          if (question.difficulty === "HARD") points = 30;
          setScore(s => s + points);
        }

        // Add to answered list so it doesn't repeat
        const newAnsweredIds = [...answeredIds, question.id];
        setAnsweredIds(newAnsweredIds);

        // Small delay so user sees feedback
        setTimeout(() => {
          fetchNext(newAnsweredIds);
        }, 1500);

      } catch (error) {
        console.error("Failed to verify answer:", error);
      }
    });
  };

  const finishQuiz = () => {
    startTransition(async () => {
      try {
        await submitQuizScore(quizId, score);
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        console.error("Failed to submit score:", error);
      }
    });
  };

  if (isLoadingNext && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-zinc-500 font-medium animate-pulse">Memuat algoritma adaptif...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-sm">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Kuis Selesai!</h2>
        <p className="text-zinc-500 mb-8">Anda telah menyelesaikan sesi adaptif untuk {quizTitle}.</p>
        
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 mb-8 inline-block min-w-[200px]">
          <span className="block text-sm text-zinc-500 mb-1">Total Skor</span>
          <span className="text-5xl font-black text-primary">{score}</span>
        </div>

        <button
          onClick={finishQuiz}
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{quizTitle}</h1>
          <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
            <BrainCircuit className="w-4 h-4" />
            Mode Adaptif Memori
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-zinc-500">Skor Aktif</div>
          <div className="text-2xl font-bold text-primary">{score}</div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {isLoadingNext && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
               <p className="text-sm font-bold text-primary animate-pulse italic">Mempersiapkan Tantangan Berikutnya...</p>
             </div>
          </div>
        )}

        {/* Difficulty Badge */}
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider
          bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          Tingkat: {question.difficulty}
        </div>

        <h3 className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-8 leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option;
            let stateClass = "border-zinc-200 dark:border-zinc-800 hover:border-primary hover:bg-primary/5";
            
            if (isSelected) {
              stateClass = "border-primary bg-primary/10 ring-1 ring-primary";
              if (feedback === "correct") stateClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500";
              if (feedback === "incorrect") stateClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-red-500";
            } else if (feedback) {
              // Dim other options during feedback
              stateClass = "border-zinc-200 dark:border-zinc-800 opacity-50";
            }

            return (
              <button
                key={index}
                disabled={!!feedback || isPending}
                onClick={() => setSelectedOption(option)}
                className={cn(
                  "w-full text-left flex items-center p-4 rounded-xl border-2 transition-all font-medium text-zinc-700 dark:text-zinc-300",
                  stateClass
                )}
              >
                <div className="flex-1 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold opacity-70">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
                {isSelected && feedback === "correct" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isSelected && feedback === "incorrect" && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleAnswerSubmit}
            disabled={!selectedOption || !!feedback || isPending}
            className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {isPending ? "Mengecek..." : "Periksa Jawaban"}
            {!isPending && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
