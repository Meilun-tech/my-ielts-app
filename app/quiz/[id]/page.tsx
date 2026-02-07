"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ReadingQuiz from "@/components/ReadingQuiz"
import type { QuestionType } from "@/types/quiz"

type RawQuestion = {
  id: string
  type: string
  stem: string
  options?: string[]
  correctAnswer: string
  explanation: string
  context?: string
  nextContext?: string
  groupId?: string
}

type FetchedPassage = {
  id: string
  title: string
  difficulty: string
  timeLimit: number
  passageContent: string
  questions: RawQuestion[]
}

function normalizeTfng(v: string): "T" | "F" | "NG" {
  const u = v.toUpperCase().trim()
  if (u === "TRUE") return "T"
  if (u === "FALSE") return "F"
  if (u === "NOT GIVEN" || u === "NG") return "NG"
  return v as "T" | "F" | "NG"
}

function buildPassage(data: FetchedPassage) {
  const paragraphs = data.passageContent
    .split("\n\n")
    .filter((p) => p.trim())
    .map((content, index) => ({
      label: String.fromCharCode(65 + index),
      content: content.trim(),
    }))
  return { title: data.title, paragraphs }
}

function buildQuestions(data: FetchedPassage): QuestionType[] {
  return data.questions.map((q) => {
    const type =
      q.type === "filling"
        ? ("fillblank" as const)
        : (q.type as "choice" | "tfng" | "fillblank")
    const base = {
      id: q.id,
      stem: q.stem,
      options: q.options ?? [],
      correctAnswer:
        type === "tfng" ? normalizeTfng(q.correctAnswer) : q.correctAnswer,
      explanation: q.explanation,
    }
    if (type === "fillblank") {
      return {
        ...base,
        type: "fillblank" as const,
        context: q.context ?? "",
        nextContext: q.nextContext,
      }
    }
    return {
      ...base,
      type,
      ...(q.groupId != null && { groupId: q.groupId }),
    }
  })
}

export default function QuizPage() {
  const params = useParams()
  const id = params?.id as string
  const [passage, setPassage] = useState<{ title: string; paragraphs: { label: string; content: string }[] } | null>(null)
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    fetch(`/data/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json() as Promise<FetchedPassage>
      })
      .then((data) => {
        setPassage(buildPassage(data))
        setQuestions(buildQuestions(data))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        加载题目中...
      </div>
    )
  }

  if (notFound || !passage || !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404 Not Found</h1>
          <p className="text-muted-foreground">
            找不到 ID 为 <strong>{id}</strong> 的文章。<br />
            请确认 public/data 文件夹里是否有 {id}.json 文件。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingQuiz passage={passage} questions={questions} />
    </div>
  )
}
