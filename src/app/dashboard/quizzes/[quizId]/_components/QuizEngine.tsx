"use client";

import { useEffect, useState, useTransition } from "react";
import { getNextQuestion, verifyAnswer, submitQuizScore, NextQuestionResult, Difficulty } from "@/app/actions/quiz";
import { Loader2, ArrowRight, BrainCircuit, CheckCircle2, XCircle, Trophy, Lightbulb } from "lucide-react";
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
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [wasCorrectLastTime, setWasCorrectLastTime] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  
  // UI State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isLoadingNext, setIsLoadingNext] = useState(true);
  const [actualCorrectAnswer, setActualCorrectAnswer] = useState<string | null>(null);

  // Initialize Quiz
  useEffect(() => {
    fetchNext();
  }, [quizId]);

  const fetchNext = async (currentAnsweredIds?: string[]) => {
    setIsLoadingNext(true);
    setQuestion(null);
    setSelectedOption(null);
    setFeedback(null);
    setActualCorrectAnswer(null);
    
    try {
      const ids = currentAnsweredIds || answeredIds;
      const result = await getNextQuestion(quizId, currentDifficulty, wasCorrectLastTime, ids);
      if (result && result.isFinished) {
        setTotalQuestions(result.totalQuestions);
        setIsFinished(true);
      } else if (result) {
        setQuestion(result);
        setCurrentDifficulty(result.difficulty);
        setTotalQuestions(result.totalQuestions);
      }
    } catch (error) {
      console.error("Gagal memuat soal berikutnya:", error);
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || !question) return;

    startTransition(async () => {
      try {
        const result = await verifyAnswer(question.id, selectedOption);
        const isCorrect = result.isCorrect;
        
        setFeedback(isCorrect ? "correct" : "incorrect");
        setWasCorrectLastTime(isCorrect);
        setActualCorrectAnswer(result.correctAnswer);
        
        if (isCorrect) {
          setCorrectCount(c => c + 1);
        } else {
          setIncorrectCount(c => c + 1);
        }

        const newAnsweredIds = [...answeredIds, question.id];
        setAnsweredIds(newAnsweredIds);

        // Durasi delay agar user sempat membaca feedback/jawaban yang benar
        setTimeout(() => {
          fetchNext(newAnsweredIds);
        }, isCorrect ? 1200 : 3500); // Beri waktu lebih lama jika salah agar bisa baca kunci jawaban

      } catch (error) {
        console.error("Gagal verifikasi jawaban:", error);
      }
    });
  };

  const finishQuiz = () => {
    startTransition(async () => {
      try {
        await submitQuizScore(quizId, correctCount, incorrectCount, totalQuestions);
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        console.error("Gagal menyimpan skor:", error);
      }
    });
  };

  const liveScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const currentQuestionNumber = Math.min(answeredIds.length + 1, totalQuestions);

  if (isLoadingNext && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <BrainCircuit className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-zinc-500 font-bold animate-pulse">Menghitung Jalur Adaptif...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 max-w-2xl mx-auto text-center shadow-xl">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Trophy className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Luar Biasa!</h2>
        <p className="text-zinc-500 mb-8 font-medium">Sesi pembelajaran adaptif untuk <span className="text-indigo-600 font-bold">{quizTitle}</span> telah selesai.</p>
        
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800">
            <span className="block text-[10px] font-black text-zinc-400 mb-1 uppercase tracking-widest">Score</span>
            <span className="text-4xl font-black text-indigo-600">{liveScore}</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30">
            <span className="block text-[10px] font-black text-emerald-600/60 mb-1 uppercase tracking-widest">Benar</span>
            <span className="text-4xl font-black text-emerald-600">{correctCount}</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30">
            <span className="block text-[10px] font-black text-rose-500/60 mb-1 uppercase tracking-widest">Salah</span>
            <span className="text-4xl font-black text-rose-500">{incorrectCount}</span>
          </div>
        </div>

        <button
          onClick={finishQuiz}
          disabled={isPending}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Selesaikan & Simpan Progress
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">{quizTitle}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter",
                        question?.difficulty === "HARD" ? "bg-rose-100 text-rose-600" : 
                        question?.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                        Level: {question?.difficulty}
                    </span>
                </div>
            </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Progress</div>
          <div className="text-2xl font-black text-indigo-600">
            {currentQuestionNumber}
            <span className="text-zinc-300 font-medium text-lg"> / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 mb-10 p-0.5 shadow-inner">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
          style={{ width: `${totalQuestions > 0 ? (answeredIds.length / totalQuestions) * 100 : 0}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden transition-all">
        {isLoadingNext && (
          <div className="absolute inset-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
             <p className="text-sm font-black text-indigo-600 animate-pulse tracking-widest uppercase">Menganalisis Performa...</p>
          </div>
        )}

        <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-10 leading-snug">
          {question?.question}
        </h3>

        <div className="space-y-4 mb-10">
          {question?.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === actualCorrectAnswer;
            
            let stateClass = "border-zinc-100 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30";
            
            if (isSelected) {
              stateClass = "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-600";
              if (feedback === "correct") stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 text-emerald-700 dark:text-emerald-400";
              if (feedback === "incorrect") stateClass = "border-rose-500 bg-rose-50 dark:bg-rose-900/20 ring-2 ring-rose-500 text-rose-700 dark:text-rose-400";
            } else if (feedback) {
              if (feedback === "incorrect" && isCorrectOption) {
                stateClass = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 text-emerald-700 dark:text-emerald-400 animate-pulse";
              } else {
                stateClass = "border-zinc-50 dark:border-zinc-900 opacity-40 grayscale-[0.5]";
              }
            }

            return (
              <button
                key={index}
                disabled={!!feedback || isPending}
                onClick={() => setSelectedOption(option)}
                className={cn(
                  "w-full text-left flex items-center p-5 rounded-2xl border-2 transition-all duration-300 font-bold",
                  stateClass
                )}
              >
                <div className="flex-1 flex items-center gap-4">
                  <span className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl border-2 text-sm font-black transition-colors",
                    isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-lg">{option}</span>
                </div>
                
                {feedback && isCorrectOption && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-lg animate-in zoom-in-50 duration-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black">Benar</span>
                    </div>
                )}
                {isSelected && feedback === "incorrect" && <XCircle className="w-6 h-6 text-rose-500 animate-shake" />}
              </button>
            );
          })}
        </div>

        {/* Footer Info & Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2 text-zinc-400 italic text-sm">
             <Lightbulb className="w-4 h-4 text-amber-500" />
             {feedback === "incorrect" ? "Pelajari jawabannya untuk soal serupa nanti." : "Pilih jawaban yang paling tepat."}
          </div>
          <button
            onClick={handleAnswerSubmit}
            disabled={!selectedOption || !!feedback || isPending}
            className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            {isPending ? "Menganalisis..." : "Periksa Jawaban"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}