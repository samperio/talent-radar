import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { loadSession, saveSession, clearSession } from '../../services/StorageService';
import { Button } from '../../components/ui/button';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../../components/ui/dialog';
import type { Answer, Domain, Question } from '../../types';

function buildQuestionList(domains: Domain[]) {
  const questions: { question: Question; domainId: string; topicId: string }[] = [];
  for (const d of domains) {
    for (const t of d.topics) {
      for (const q of t.questions) {
        questions.push({ question: q, domainId: d.id, topicId: t.id });
      }
    }
  }
  return questions;
}

export function Evaluation() {
  const navigate = useNavigate();
  const { currentCandidate, domains, completeEvaluation, logoutCandidate } = useAppStore();

  const allQuestions = useMemo(() => buildQuestionList(domains), [domains]);
  const total = allQuestions.length;

  const [step, setStep] = useState<'intro' | 'quiz' | 'done'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load session on mount
  useEffect(() => {
    if (!currentCandidate) {
      navigate('/candidate/login');
      return;
    }
    const saved = loadSession(currentCandidate.id);
    if (saved.length > 0) {
      setAnswers(saved);
      const lastAnswered = saved.length;
      setCurrent(Math.min(lastAnswered, total - 1));
      setStep('quiz');
    }
  }, [currentCandidate, navigate, total]);

  // Restore selection for current question
  useEffect(() => {
    const q = allQuestions[current];
    if (!q) return;
    const existing = answers.find((a) => a.questionId === q.question.id);
    setSelectedOption(existing ? (existing.value as number) : null);
  }, [current, answers, allQuestions]);

  // Autosave every 3 questions
  const autosave = useCallback(
    (updatedAnswers: Answer[]) => {
      if (!currentCandidate) return;
      if (updatedAnswers.length % 3 === 0) {
        saveSession(currentCandidate.id, updatedAnswers);
      }
    },
    [currentCandidate]
  );

  if (!currentCandidate) return null;

  const q = allQuestions[current];
  const answered = answers.length;
  const progress = Math.round((answered / total) * 100);

  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx + 1); // 1-indexed
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const q = allQuestions[current];
    const newAnswer: Answer = {
      questionId: q.question.id,
      domainId: q.domainId,
      topicId: q.topicId,
      value: selectedOption,
      normalizedScore: ((selectedOption - 1) / 3) * 100,
    };
    const updated = [
      ...answers.filter((a) => a.questionId !== q.question.id),
      newAnswer,
    ];
    setAnswers(updated);
    autosave(updated);

    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = () => {
    // Include current answer if not saved
    let finalAnswers = [...answers];
    if (selectedOption !== null) {
      const q = allQuestions[current];
      const newAnswer: Answer = {
        questionId: q.question.id,
        domainId: q.domainId,
        topicId: q.topicId,
        value: selectedOption,
        normalizedScore: ((selectedOption - 1) / 3) * 100,
      };
      finalAnswers = [...answers.filter((a) => a.questionId !== q.question.id), newAnswer];
    }
    completeEvaluation(currentCandidate.id, finalAnswers);
    clearSession(currentCandidate.id);
    logoutCandidate();
    navigate('/candidate/done');
  };

  const isLastQuestion = current === total - 1;
  const currentAnswered = answers.some((a) => a.questionId === q.question.id);

  if (step === 'intro') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Evaluación Técnica
          </h1>
          <p className="mb-6 text-gray-600">
            Hola, <strong>{currentCandidate.name}</strong>. A continuación realizarás una evaluación
            de competencias en Arquitectura de Integración de Sistemas.
          </p>

          <div className="mb-6 rounded-xl bg-blue-50 px-5 py-4 text-sm text-blue-800 space-y-2">
            <p className="font-semibold">Antes de comenzar:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>La evaluación contiene <strong>{total} preguntas</strong></li>
              <li>Tiempo estimado: <strong>15-20 minutos</strong></li>
              <li>Responde según tu experiencia real, sin buscar respuestas</li>
              <li>Puedes retroceder y cambiar tus respuestas</li>
              <li>Tu progreso se guarda automáticamente</li>
            </ul>
          </div>

          <Button
            onClick={() => setStep('quiz')}
            className="w-full gap-2 py-3 text-base"
            size="lg"
          >
            Comenzar evaluación <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Pregunta {current + 1} de {total}
          </span>
          <span className="text-gray-500">{progress}% completado</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${Math.max(2, ((current) / total) * 100)}%` }}
          />
        </div>
      </div>

      {/* Domain badge */}
      <div className="mb-4 flex items-center gap-2">
        {domains
          .filter((d) => d.id === q.domainId)
          .map((d) => (
            <span
              key={d.id}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: d.color }}
            >
              {d.fullName}
            </span>
          ))}
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold leading-relaxed text-gray-900">
          {q.question.text}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.question.options?.map((option, idx) => {
            const isSelected = selectedOption === idx + 1;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full rounded-xl border-2 px-5 py-4 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className={`text-sm leading-relaxed ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={current === 0}
          className="gap-2"
        >
          <ChevronLeft size={16} /> Anterior
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={selectedOption === null && !currentAnswered}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Send size={16} /> Enviar evaluación
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={selectedOption === null && !currentAnswered}
            className="gap-2"
          >
            Siguiente <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Confirm submit */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogHeader onClose={() => setShowConfirm(false)}>
          Confirmar envío
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-gray-700">
            ¿Estás seguro de que deseas enviar tu evaluación? Una vez enviada no podrás
            modificar tus respuestas.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Respondidas: <strong>{answers.length + (selectedOption !== null ? 1 : 0)}</strong> de{' '}
            <strong>{total}</strong>
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 gap-2">
            <Send size={14} /> Enviar ahora
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
