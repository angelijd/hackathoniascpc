import React, { useState, useEffect } from 'react';
import { INTEREST_OPTIONS, EXPECTATION_OPTIONS } from '../data/preferencesData';
import { BecoBot } from './BecoBot';

interface Props {
  userName: string;
  userAge: string;
  userGrade: string;
  userCity: string;
  userSchool: string;
  darkMode: boolean;
  selectedInterests?: string[];
  selectedExpectation?: string | null;
  testType: 'critical_thinking' | 'creativity';
  onBackToWelcome: () => void;
}

interface ReportData {
  nivel: number;
  significadoNivel: string;
  habilidadeCognitiva: string;
  habilidadeSocioemocional: string;
  habilidadeMetacognitiva: string;
  pontosFortes: string;
  pontosMelhoria: string;
  proximoPasso: string;
}

export const Screen3Assessment: React.FC<Props> = ({
  userName,
  userAge,
  userGrade,
  userCity,
  userSchool,
  darkMode,
  selectedInterests = [],
  selectedExpectation = null,
  testType,
  onBackToWelcome,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
  const [completed, setCompleted] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isReportLoading, setIsReportLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [metacognitiveGoal, setMetacognitiveGoal] = useState('');

  useEffect(() => {
    if (questions.length === 0 && !isLoading) {
      generateQuestions();
    }
  }, []);

  const generateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const interests = selectedInterests
        .map((id) => INTEREST_OPTIONS.find((opt) => opt.id === id)?.label)
        .filter(Boolean);

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          age: userAge,
          grade: userGrade,
          city: userCity,
          school: userSchool,
          interests: interests.length > 0 ? interests : ['Não especificado'],
          testType
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao gerar perguntas');
      
      setQuestions(data.questions || []);
      setAnswers(Array((data.questions || []).length).fill(''));
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao carregar o laboratório.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsReportLoading(true);
    setError(null);
    try {
      const interests = selectedInterests
        .map((id) => INTEREST_OPTIONS.find((opt) => opt.id === id)?.label)
        .filter(Boolean);

      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          age: userAge,
          grade: userGrade,
          city: userCity,
          school: userSchool,
          interests: interests.length > 0 ? interests : ['Não especificado'],
          questions,
          answers,
          testType
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao gerar relatório');
      
      setReport(data as ReportData);
      setCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao gerar o relatório final.');
    } finally {
      setIsReportLoading(false);
    }
  };

  const totalQ = questions.length || 5;

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      generateReport();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = text;
    setAnswers(newAnswers);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers(Array(totalQ).fill(''));
    setCompleted(false);
    setQuestions([]);
    setReport(null);
    setSliderValue(50);
    setMetacognitiveGoal('');
    generateQuestions();
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-12 z-10 flex flex-col justify-between">
      <div
        className={`w-full rounded-[24px] sm:rounded-[28px] p-6 sm:p-9 shadow-[0_18px_45px_rgba(4,20,43,0.06)] border transition-all duration-300 ${
          darkMode
            ? 'bg-[#0B1426] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex-1">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#FDC300] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                A Inteligência Artificial está preparando suas questões...
              </p>
            </div>
          ) : isReportLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#0B7CFB] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                Analisando suas respostas e gerando seu relatório formativo...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="text-red-500 mb-2 text-3xl">⚠️</div>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4 max-w-md mx-auto">{error}</p>
              <button
                onClick={generateQuestions}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FDC300] hover:bg-[#FBB800] text-[#04142B] shadow-sm cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          ) : !completed && questions.length > 0 ? (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-6">
                  {questions[currentIdx]}
                </h2>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={7}
                  value={answers[currentIdx] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Escreva sua resposta aqui..."
                  className={`w-full p-5 rounded-2xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#FDC300] ${
                    darkMode
                      ? 'bg-slate-900/60 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <div className="flex justify-between text-xs text-slate-400 px-2">
                  <span>Mínimo sugerido: 20 caracteres</span>
                  <span>{(answers[currentIdx] || '').length} caracteres</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    currentIdx > 0
                      ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer'
                      : 'opacity-0 cursor-default pointer-events-none'
                  }`}
                >
                  ← Voltar à questão anterior
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={(answers[currentIdx] || '').trim().length < 5}
                  className={`px-8 py-3 rounded-full font-bold text-sm transition-all shadow-md ${
                    (answers[currentIdx] || '').trim().length >= 5
                      ? 'bg-[#FDC300] hover:bg-[#FBB800] text-[#04142B] cursor-pointer hover:shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  {currentIdx < totalQ - 1 ? 'Próxima Questão →' : 'Finalizar Laboratório'}
                </button>
              </div>
            </div>
          ) : completed && report ? (
            <div className="py-2 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header & Chips */}
              <div className="text-center space-y-6">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B1226] dark:text-white">
                  {testType === 'creativity' 
                    ? 'Jornada de Aprendizagem Formativa'
                    : <><span className="text-[#0B7CFB]">Jornada de Pensamento Crítico:</span> Laboratório IAS</>
                  }
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    🏷️ Cognitivo: {report.habilidadeCognitiva}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    🏷️ Socioemocional: {report.habilidadeSocioemocional}
                  </span>
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    🏷️ Metacognitivo: {report.habilidadeMetacognitiva}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex flex-col items-center w-full max-w-4xl mx-auto my-12">
                <div className="flex w-full items-center justify-between relative mb-6">
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0"></div>
                  {["Iniciante", "Em Construção", "Proficiente", "Avançado"].map((label, idx) => {
                    const levelNum = idx + 1;
                    const isCurrent = levelNum === (report.nivel || 2);
                    const isPast = levelNum < (report.nivel || 2);
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                          isCurrent 
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-125' 
                            : isPast 
                              ? 'bg-emerald-400 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                        }`}>
                          {levelNum}
                        </div>
                        <span className={`absolute top-14 text-xs font-bold text-center w-28 transition-colors ${
                          isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {label}
                          {isCurrent && <span className="block text-[10px] font-normal opacity-80 mt-1">(Você está aqui!)</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-10 max-w-3xl text-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    💡 <strong className="font-extrabold text-slate-900 dark:text-white mr-1">O que seu nível atual significa:</strong>
                    {report.significadoNivel}
                  </p>
                </div>
              </div>

              {/* 3 Feedback Cards */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Forças */}
                <div className={`p-6 rounded-3xl border flex flex-col h-full ${darkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-[#F2FDF6] border-emerald-100'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌟</span>
                    <h4 className="text-sm font-extrabold text-[#05B85B] uppercase tracking-wider">Minhas Conquistas (Feed Up)</h4>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {report.pontosFortes}
                  </p>
                </div>
                {/* Desafios */}
                <div className={`p-6 rounded-3xl border flex flex-col h-full ${darkMode ? 'bg-amber-950/20 border-amber-900/30' : 'bg-[#FFFBF0] border-amber-200'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌱</span>
                    <h4 className="text-sm font-extrabold text-amber-600 uppercase tracking-wider">Meus Desafios (Feed Back)</h4>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {report.pontosMelhoria}
                  </p>
                </div>
                {/* Próximo Passo */}
                <div className={`p-6 rounded-3xl border flex flex-col h-full ${darkMode ? 'bg-blue-950/20 border-blue-900/30' : 'bg-[#F0F7FF] border-blue-200'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h4 className="text-sm font-extrabold text-[#0B7CFB] uppercase tracking-wider">Meu Próximo Passo (Feed Forward)</h4>
                  </div>
                  <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium italic">
                    "{report.proximoPasso}"
                  </p>
                </div>
              </div>

              {/* Metacognitive Interactive Panel */}
              <div className={`mt-10 p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-extrabold mb-6">Reflexão Rápida</h3>
                
                <div className="space-y-8">
                  {/* Feeling Buttons */}
                  <div>
                    <label className="block text-sm font-semibold mb-4 text-slate-600 dark:text-slate-300">
                      Como você se sentiu ao realizar esse desafio?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSliderValue(0)}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          sliderValue === 0
                            ? 'bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-700'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`text-2xl transition-transform ${sliderValue === 0 ? 'scale-125' : 'grayscale opacity-60'}`}>
                          {testType === 'creativity' ? '😣' : '😫'}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${sliderValue === 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>
                          {testType === 'creativity' ? 'Desafiado' : 'Ansioso'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSliderValue(50)}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          sliderValue === 50
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`text-2xl transition-transform ${sliderValue === 50 ? 'scale-125' : 'grayscale opacity-60'}`}>😐</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${sliderValue === 50 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>Neutro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSliderValue(100)}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          sliderValue === 100
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className={`text-2xl transition-transform ${sliderValue === 100 ? 'scale-125' : 'grayscale opacity-60'}`}>😊</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${sliderValue === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {testType === 'creativity' ? 'Confiante' : 'Confortável'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Commitment Input */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-slate-600 dark:text-slate-300">
                      O que você faria diferente se fosse responder esse mesmo desafio de novo?
                    </label>
                    <input
                      type="text"
                      value={metacognitiveGoal}
                      onChange={(e) => setMetacognitiveGoal(e.target.value)}
                      placeholder="Escreva aqui sua reflexão em uma frase..."
                      className={`w-full p-4 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FDC300] ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={onBackToWelcome}
                  className="px-8 py-3 rounded-full text-sm font-extrabold bg-[#0B7CFB] hover:bg-[#0B45D8] text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Concluir e Voltar ao Início
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {!completed && !isLoading && questions.length > 0 && (
        <BecoBot 
          question={questions[currentIdx]}
          userName={userName}
          interests={selectedInterests}
        />
      )}
    </div>
  );
};
