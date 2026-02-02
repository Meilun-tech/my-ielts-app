"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react"

import type { QuestionType } from "@/types/quiz"

type UserAnswer = number | string | "T" | "F" | "NG"

interface WrongAnswer {
  id: string
  passageTitle: string
  questionId: string
  questionText: string
  questionType: "choice" | "tfng" | "fillblank"
  userAnswer: UserAnswer
  correctAnswer: UserAnswer
  options?: string[]
  timestamp: number
}

interface PassageData {
  title: string
  paragraphs: { label: string; content: string }[]
}

interface ReadingQuizProps {
  passage?: PassageData
  questions?: QuestionType[]
  correctAnswers?: Record<string, string>
  explanations?: Record<string, string>
}

// ============ Sample Data ============
const defaultPassage: PassageData = {
  title: "The History of the Pencil",
  paragraphs: [
    {
      label: "A",
      content:
        "The humble pencil has a rich history dating back centuries. The discovery of a large graphite deposit in Borrowdale, England, in 1564 marked the beginning of the modern pencil industry. Local shepherds found that graphite was useful for marking sheep, and soon people realized its potential for writing and drawing.",
    },
    {
      label: "B",
      content:
        "Initially, graphite sticks were wrapped in string or sheepskin to keep hands clean. However, this method was impractical. In 1795, French engineer Nicolas-Jacques Conté developed the modern pencil core by mixing powdered graphite with clay and firing it in a kiln. This breakthrough allowed manufacturers to produce pencils of varying hardness.",
    },
    {
      label: "C",
      content:
        "The 19th century saw rapid development in pencil manufacturing. German craftsmen in Nuremberg became renowned for their high-quality pencils, establishing factories that still operate today. The distinctive hexagonal shape was introduced to prevent pencils from rolling off desks and to provide a better grip.",
    },
    {
      label: "D",
      content:
        "Today, approximately 14 billion pencils are produced annually worldwide. Modern pencils come in various forms: mechanical pencils, colored pencils, and specialized drawing pencils. Despite the digital age, the pencil remains an essential tool for artists, students, and professionals alike, valued for its simplicity and reliability.",
    },
    {
      label: "E",
      content:
        "Environmental concerns have also influenced pencil manufacturing. Many companies now use sustainable wood sources and recycled materials. Some innovative manufacturers have even developed pencils that can be planted after use, containing seeds in their end caps that grow into plants when the pencil becomes too short to use.",
    },
  ],
}

const defaultQuestions: QuestionType[] = [
  {
    id: "Q1",
    type: "choice",
    stem: "What was graphite first used for in Borrowdale?",
    options: ["Writing letters", "Marking sheep", "Drawing pictures", "Building materials"],
    correctAnswer: "Marking sheep",
    explanation: "",
  },
  {
    id: "Q2",
    type: "tfng",
    stem: "German craftsmen in Nuremberg introduced the hexagonal pencil shape to improve grip and prevent rolling.",
    options: [],
    correctAnswer: "T",
    explanation: "",
  },
  {
    id: "Q3",
    type: "fillblank",
    stem: "Approximately how many billion pencils are produced annually worldwide?",
    options: [],
    context: "Sample context for fill-in.",
    correctAnswer: "14",
    explanation: "",
  },
]

// ============ Helper Functions ============
const WRONG_ANSWERS_KEY = "ielts_wrong_answers"

function getWrongAnswers(): WrongAnswer[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(WRONG_ANSWERS_KEY)
  return stored ? JSON.parse(stored) : []
}

function saveWrongAnswers(newWrongAnswers: WrongAnswer[]) {
  const existing = getWrongAnswers()
  const updated = [...existing, ...newWrongAnswers]
  localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(updated))
}

function deleteWrongAnswer(id: string) {
  const existing = getWrongAnswers()
  const updated = existing.filter((w) => w.id !== id)
  localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(updated))
}

function clearAllWrongAnswers() {
  localStorage.removeItem(WRONG_ANSWERS_KEY)
}

function checkAnswer(question: QuestionType, userAnswer: UserAnswer): boolean {
  switch (question.type) {
    case "choice": {
      const idx = question.options.findIndex((opt) =>
        opt.trim().toLowerCase().startsWith(question.correctAnswer.trim().toLowerCase())
      )
      return userAnswer === idx
    }
    case "tfng":
      return userAnswer === question.correctAnswer
    case "fillblank": {
      const answer = String(userAnswer ?? "").toLowerCase().trim()
      return answer === question.correctAnswer.toLowerCase().trim()
    }
    default:
      return false
  }
}

/** 按 groupId 分组判分：多题一组时用集合对比（顺序无关），返回每题是否正确及组内第一题的正确答案文案 */
function getGroupScoreState(
  questions: QuestionType[],
  answers: Record<string, UserAnswer>
): { isCorrectByQid: Record<string, boolean>; groupCorrectAnswerTextByQid: Record<string, string> } {
  const isCorrectByQid: Record<string, boolean> = {}
  const groupCorrectAnswerTextByQid: Record<string, string> = {}
  const groupKey = (q: QuestionType) =>
    q.type === "choice" && "groupId" in q && (q as { groupId?: string }).groupId
      ? (q as { groupId: string }).groupId
      : q.id
  const groups = new Map<string, QuestionType[]>()
  for (const q of questions) {
    const key = groupKey(q)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(q)
  }
  for (const [, group] of groups) {
    if (group.length === 1) {
      const q = group[0]
      isCorrectByQid[q.id] = checkAnswer(q, answers[q.id])
      continue
    }
    const allChoice = group.every((q) => q.type === "choice")
    if (!allChoice) {
      group.forEach((q) => {
        isCorrectByQid[q.id] = checkAnswer(q, answers[q.id])
      })
      continue
    }
    const userIndices = group
      .map((q) => answers[q.id])
      .filter((v): v is number => typeof v === "number")
    const getCorrectIdx = (q: QuestionType) => {
      if (q.type !== "choice") return -1
      return q.options.findIndex((opt) =>
        opt.trim().toLowerCase().startsWith((q as { correctAnswer: string }).correctAnswer.trim().toLowerCase())
      )
    }
    const correctIndices = group.map((q) => getCorrectIdx(q))
    const userSet = new Set(userIndices)
    const correctSet = new Set(correctIndices)
    const isGroupCorrect =
      userSet.size === correctSet.size && [...userSet].every((i) => correctSet.has(i))
    group.forEach((q) => {
      isCorrectByQid[q.id] = isGroupCorrect
    })
    if (!isGroupCorrect) {
      const correctLetters = [...correctSet]
        .sort((a, b) => a - b)
        .map((i) => String.fromCharCode(65 + i))
      const firstId = group[0].id
      groupCorrectAnswerTextByQid[firstId] = correctLetters.join(", ")
    }
  }
  return { isCorrectByQid, groupCorrectAnswerTextByQid }
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============ Main Component ============
export default function ReadingQuiz({ passage = defaultPassage, questions = defaultQuestions }: ReadingQuizProps) {
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showWrongAnswers, setShowWrongAnswers] = useState(false)
  const [wrongAnswersList, setWrongAnswersList] = useState<WrongAnswer[]>([])
  const [expandedWrong, setExpandedWrong] = useState<string | null>(null)

  // Highlight state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; isHighlighted: boolean } | null>(null)
  const [selectedText, setSelectedText] = useState("")
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWrongAnswersList(getWrongAnswers())
  }, [showWrongAnswers])

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setContextMenu(null)
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      setContextMenu(null)
      return
    }

    e.preventDefault()

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : (container as HTMLElement)
    const isHighlighted = parentElement?.tagName === "MARK"

    setSelectedText(text)
    setSelectedRange(range.cloneRange())
    setContextMenu({ x: e.clientX, y: e.clientY, isHighlighted })
  }, [])

  const handleHighlight = useCallback(() => {
    if (!selectedRange || !selectedText) return

    const mark = document.createElement("mark")
    mark.style.backgroundColor = "#FFEB3B"
    mark.style.padding = "0 2px"
    mark.style.borderRadius = "2px"

    try {
      selectedRange.surroundContents(mark)
    } catch {
      const fragment = selectedRange.extractContents()
      mark.appendChild(fragment)
      selectedRange.insertNode(mark)
    }

    window.getSelection()?.removeAllRanges()
    setContextMenu(null)
    setSelectedText("")
    setSelectedRange(null)
  }, [selectedRange, selectedText])

  const handleRemoveHighlight = useCallback(() => {
    if (!selectedRange) return

    const container = selectedRange.commonAncestorContainer
    const markElement =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest("mark")
        : (container as HTMLElement).closest("mark")

    if (markElement && markElement.parentNode) {
      const parent = markElement.parentNode
      while (markElement.firstChild) {
        parent.insertBefore(markElement.firstChild, markElement)
      }
      parent.removeChild(markElement)
      parent.normalize()
    }

    window.getSelection()?.removeAllRanges()
    setContextMenu(null)
    setSelectedText("")
    setSelectedRange(null)
  }, [selectedRange])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenu) {
        const target = e.target as HTMLElement
        if (!target.closest(".context-menu")) {
          setContextMenu(null)
        }
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [contextMenu])

  // Answer handlers
  const handleChoiceSelect = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleTFNGSelect = (questionId: string, value: "T" | "F" | "NG") => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleFillBlank = (questionId: string, value: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const groupState = getGroupScoreState(questions, answers)

  const handleSubmit = () => {
    const unanswered = questions.filter((q) => {
      const answer = answers[q.id]
      if (answer === undefined || answer === null) return true
      if (q.type === "fillblank" && (answer as string).trim() === "") return true
      return false
    })

    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} question(s) remaining.`)
      return
    }

    const wrongs: WrongAnswer[] = []
    questions.forEach((q) => {
      if (!groupState.isCorrectByQid[q.id]) {
        const userAnswer = answers[q.id]
        const correctDisplay =
          groupState.groupCorrectAnswerTextByQid[q.id] ?? (q as { correctAnswer: string }).correctAnswer
        const wrongEntry: WrongAnswer = {
          id: `${passage.title}-${q.id}-${Date.now()}`,
          passageTitle: passage.title,
          questionId: q.id,
          questionText: q.stem,
          questionType: q.type,
          userAnswer,
          correctAnswer: correctDisplay,
          options: q.options?.length ? q.options : undefined,
          timestamp: Date.now(),
        }
        wrongs.push(wrongEntry)
      }
    })

    if (wrongs.length > 0) {
      saveWrongAnswers(wrongs)
    }

    setIsSubmitted(true)
  }

  const handleRetry = () => {
    setAnswers({})
    setIsSubmitted(false)
  }

  const handleDeleteWrong = (id: string) => {
    deleteWrongAnswer(id)
    setWrongAnswersList(getWrongAnswers())
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all wrong answers?")) {
      clearAllWrongAnswers()
      setWrongAnswersList([])
    }
  }

  const correctCount = questions.filter((q) => groupState.isCorrectByQid[q.id]).length

  // ============ Render Functions ============
  const renderChoice = (q: QuestionType & { type: "choice" }) => {
    const userAnswer = answers[q.id] as number | undefined
    const correctIndex = q.options.findIndex((opt) =>
      opt.trim().toLowerCase().startsWith(q.correctAnswer.trim().toLowerCase())
    )
    const questionCorrect = isSubmitted && groupState.isCorrectByQid[q.id]
    const groupCorrectText = groupState.groupCorrectAnswerTextByQid[q.id]
    const isGroupChoice = !!(q as { groupId?: string }).groupId
    return (
      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          const isSelected = userAnswer === idx
          const showCorrect =
            isSubmitted &&
            (isGroupChoice ? questionCorrect && isSelected : idx === correctIndex)
          const isWrong = isSubmitted && isSelected && !questionCorrect
          return (
            <button
              key={idx}
              onClick={() => handleChoiceSelect(q.id, idx)}
              disabled={isSubmitted}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                !isSubmitted && isSelected && "border-blue-500 bg-blue-50",
                !isSubmitted && !isSelected && "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50",
                showCorrect && "border-green-500 bg-green-50",
                isWrong && "border-red-500 bg-red-50",
                isSubmitted && !showCorrect && !isWrong && "border-gray-200 bg-white opacity-60"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  !isSubmitted && isSelected && "border-blue-500 bg-blue-500 text-white",
                  !isSubmitted && !isSelected && "border-gray-400 text-gray-500",
                  showCorrect && "border-green-500 bg-green-500 text-white",
                  isWrong && "border-red-500 bg-red-500 text-white",
                  isSubmitted && !showCorrect && !isWrong && "border-gray-300 text-gray-400"
                )}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-relaxed text-gray-800">{opt}</span>
              {showCorrect && <span className="ml-auto text-xs text-green-600">Correct</span>}
              {isWrong && <span className="ml-auto text-xs text-red-600">Wrong</span>}
            </button>
          )
        })}
        {groupCorrectText && isSubmitted && (
          <p className="mt-2 text-sm text-red-600">正确答案：{groupCorrectText}</p >)}
      </div>
    )
  }

  const renderTFNG = (q: QuestionType & { type: "tfng" }) => {
    const userAnswer = answers[q.id] as "T" | "F" | "NG" | undefined
    const options: { value: "T" | "F" | "NG"; label: string }[] = [
      { value: "T", label: "TRUE" },
      { value: "F", label: "FALSE" },
      { value: "NG", label: "NOT GIVEN" },
    ]
    return (
      <div className="flex gap-3">
        {options.map(({ value, label }) => {
          const isSelected = userAnswer === value
          const isCorrect = value === q.correctAnswer
          const isWrong = isSubmitted && isSelected && !isCorrect
          const showCorrect = isSubmitted && isCorrect
          return (
            <button
              key={value}
              onClick={() => handleTFNGSelect(q.id, value)}
              disabled={isSubmitted}
              className={cn(
                "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
                !isSubmitted && isSelected && "border-blue-500 bg-blue-50 text-blue-700",
                !isSubmitted && !isSelected && "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50",
                showCorrect && "border-green-500 bg-green-50 text-green-700",
                isWrong && "border-red-500 bg-red-50 text-red-700",
                isSubmitted && !showCorrect && !isWrong && "border-gray-200 bg-white text-gray-400"
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  const renderFillBlank = (q: QuestionType & { type: "fillblank" }) => {
    const userAnswer = (answers[q.id] as string) ?? ""
    const isCorrect = isSubmitted && checkAnswer(q, userAnswer)
    const isWrong = isSubmitted && !isCorrect
    return (
      <div className="space-y-2">
        {/* 题干上方：若存在 context 则显示，灰色小字，保留换行 */}
        {q.context != null && q.context !== "" && (
          <div className="mb-2 text-xs text-gray-500 whitespace-pre-line leading-relaxed">
            {q.context}
          </div>
        )}
        {q.stem && <div className="text-lg font-medium mb-2">{q.stem}</div>}
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => handleFillBlank(q.id, e.target.value)}
          disabled={isSubmitted}
          placeholder="Enter your answer"
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all text-gray-900",
            !isSubmitted && "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
            isCorrect && "border-green-500 bg-green-50",
            isWrong && "border-red-500 bg-red-50"
          )}
        />
        {q.nextContext != null && q.nextContext !== "" && (
          <div className="mt-1 text-xs text-gray-500 whitespace-pre-line">{q.nextContext}</div>
        )}
        {isSubmitted && (
          <div className={cn("text-sm", isCorrect ? "text-green-600" : "text-red-600")}>
            {isCorrect ? "Correct!" : `Wrong. Correct answer: ${q.correctAnswer}`}
          </div>
        )}
      </div>
    )
  }

  const renderQuestion = (q: QuestionType) => {
    switch (q.type) {
      case "choice":
        return renderChoice(q as QuestionType & { type: "choice" })
      case "tfng":
        return renderTFNG(q as QuestionType & { type: "tfng" })
      case "fillblank":
        return renderFillBlank(q as QuestionType & { type: "fillblank" })
    }
  }

  const getTypeLabel = (type: "choice" | "tfng" | "fillblank") => {
    const labels: Record<"choice" | "tfng" | "fillblank", string> = {
      choice: "Choice",
      tfng: "True/False/Not Given",
      fillblank: "Fill in the Blank",
    }
    return labels[type]
  }

  // ============ Render ============
  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="flex min-h-screen flex-col bg-amber-50/50"
    >
      {/* Header */}
      <header className="border-b border-amber-200/50 bg-white/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">IE</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">IELTS Reading Practice</h1>
              <p className="text-xs text-gray-500">Academic Module</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowWrongAnswers(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Wrong Answers ({wrongAnswersList.length})
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">Time Remaining</p>
              <p className="font-mono text-lg font-semibold text-gray-800">20:00</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto flex h-[calc(100vh-140px)] max-w-7xl gap-6">
          {/* Passage Section - 60% */}
          <section className="w-[60%] overflow-hidden rounded-xl border border-amber-200/50 bg-white/90 p-6 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                READING PASSAGE
              </span>
              <h2 className="text-xl font-semibold text-gray-800">{passage.title}</h2>
            </div>
            <div className="h-[calc(100%-80px)] overflow-y-auto pr-4">
              <div className="space-y-6">
                {passage.paragraphs.map((para) => (
                  <div key={para.label} className="flex gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-600">
                      {para.label}
                    </span>
                    <p className="text-base leading-7 text-gray-700">{para.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Questions Section - 40% */}
          <section className="w-[40%] overflow-hidden rounded-xl border border-amber-200/50 bg-white/90 p-6 shadow-sm">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <span className="mb-2 inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                QUESTIONS
              </span>
              <h3 className="text-lg font-semibold text-gray-800">Questions 1-{questions.length}</h3>
            </div>
            <div className="h-[calc(100%-160px)] overflow-y-auto pr-2">
              <div className="space-y-8">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {q.id}
                      </span>
                      <div className="flex-1">
                        <span className="mb-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {getTypeLabel(q.type)}
                        </span>
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.stem}</p>
                      </div>
                    </div>
                    <div className="ml-9">{renderQuestion(q)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              {!isSubmitted ? (
                <>
                  <p className="text-sm text-gray-500">
                    {Object.keys(answers).length} of {questions.length} answered
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Submit Answers
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800">
                    Score: {correctCount} / {questions.length}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu fixed z-50 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.isHighlighted ? (
            <button
              onClick={handleRemoveHighlight}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="h-3 w-3 rounded bg-gray-300" />
              Remove Highlight
            </button>
          ) : (
            <button
              onClick={handleHighlight}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="h-3 w-3 rounded bg-yellow-400" />
              Highlight Text
            </button>
          )}
        </div>
      )}

      {/* Wrong Answers Modal */}
      {showWrongAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Wrong Answers Book</h2>
                <p className="text-sm text-gray-500">{wrongAnswersList.length} questions recorded</p>
              </div>
              <div className="flex items-center gap-2">
                {wrongAnswersList.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowWrongAnswers(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
              {wrongAnswersList.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No wrong answers recorded yet!</p>
                  <p className="text-sm text-gray-400">Keep practicing to track your mistakes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wrongAnswersList.map((wrong) => (
                    <div key={wrong.id} className="rounded-lg border border-gray-200 bg-white">
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        onClick={() => setExpandedWrong(expandedWrong === wrong.id ? null : wrong.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                            {wrong.questionId}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{wrong.questionText}</p>
                            <div className="mt-1 flex gap-2">
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                {getTypeLabel(wrong.questionType)}
                              </span>
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                                {wrong.passageTitle}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteWrong(wrong.id)
                            }}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <svg
                            className={cn("h-5 w-5 text-gray-400 transition-transform", expandedWrong === wrong.id && "rotate-180")}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {expandedWrong === wrong.id && (
                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Your Answer: </span>
                              <span className="text-red-600">
                                {wrong.questionType === "choice" && wrong.options && typeof wrong.userAnswer === "number"
                                  ? wrong.options[wrong.userAnswer] ?? String(wrong.userAnswer)
                                  : String(wrong.userAnswer)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Correct Answer: </span>
                              <span className="text-green-600">
                                {wrong.questionType === "choice" && wrong.options
                                  ? wrong.options.find((opt) =>
                                      opt.trim().toLowerCase().startsWith(String(wrong.correctAnswer).trim().toLowerCase())
                                    ) ?? String(wrong.correctAnswer)
                                  : String(wrong.correctAnswer)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Recorded: {new Date(wrong.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
