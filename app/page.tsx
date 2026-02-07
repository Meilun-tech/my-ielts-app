"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DailyCheckIn from "@/components/DailyCheckIn"

type ReadingMeta = {
  id: string
  title: string
  difficulty: string
  timeLimit: number
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: "Easy", className: "bg-green-100 text-green-800" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
  hard: { label: "Hard", className: "bg-red-100 text-red-800" },
}

export default function Page() {
  const router = useRouter()
  const [practices, setPractices] = useState<ReadingMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/reading-list")
      .then((res) => {
        if (!res.ok) throw new Error("加载题目列表失败")
        return res.json()
      })
      .then((data: ReadingMeta[]) => {
        setPractices(data)
        setError(null)
      })
      .catch((err) => {
        console.error("加载题目失败:", err)
        setError(err instanceof Error ? err.message : "加载失败")
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePracticeStart = (id: string) => {
    router.push(`/quiz/${id}`)
  }

  const getDifficultyStyle = (d: string) => {
    const key = d.toLowerCase() as keyof typeof difficultyConfig
    return difficultyConfig[key] ?? difficultyConfig.medium
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        正在加载题库...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">加载失败</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          📖 雅思阅读练习
        </h1>

        <DailyCheckIn />

        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  难度
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  建议用时
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {practices.map((practice) => {
                const style = getDifficultyStyle(practice.difficulty)
                return (
                  <tr
                    key={practice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {practice.id}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {practice.title}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ⏱️ {practice.timeLimit} 分钟
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handlePracticeStart(practice.id)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        开始练习
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-4">
          {practices.map((practice) => {
            const style = getDifficultyStyle(practice.difficulty)
            return (
              <div
                key={practice.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-medium text-gray-900 leading-tight">
                    {practice.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    ⏱️ {practice.timeLimit} 分钟
                  </span>
                  <button
                    onClick={() => handlePracticeStart(practice.id)}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    开始练习
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
