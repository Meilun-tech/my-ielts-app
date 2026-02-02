"use client"

import { useRouter } from "next/navigation"

interface Practice {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  duration: string
}

const practices: Practice[] = [
  { id: "P001", title: "雅思阅读真题1", difficulty: "medium", duration: "20 分钟" },
  { id: "P002", title: "雅思阅读真题2", difficulty: "medium", duration: "20 分钟" },
  { id: "P003", title: "雅思阅读真题3", difficulty: "medium", duration: "20 分钟" },
  { id: "P004", title: "雅思阅读真题4", difficulty: "medium", duration: "20 分钟" },
  { id: "P005", title: "雅思阅读真题5", difficulty: "medium", duration: "20 分钟" },
  { id: "P006", title: "雅思阅读真题6", difficulty: "medium", duration: "20 分钟" },
  { id: "P007", title: "雅思阅读真题7", difficulty: "medium", duration: "20 分钟" },
  { id: "P008", title: "雅思阅读真题8", difficulty: "medium", duration: "20 分钟" },
  { id: "P009", title: "雅思阅读真题9", difficulty: "medium", duration: "20 分钟" },
  { id: "P010", title: "雅思阅读真题10", difficulty: "medium", duration: "20 分钟" },
  { id: "P011", title: "雅思阅读真题11", difficulty: "medium", duration: "20 分钟" },
  { id: "P012", title: "雅思阅读真题12", difficulty: "medium", duration: "20 分钟" },
  { id: "P013", title: "雅思阅读真题13", difficulty: "medium", duration: "20 分钟" },
  { id: "P014", title: "雅思阅读真题14", difficulty: "medium", duration: "20 分钟" },
  { id: "P015", title: "雅思阅读真题15", difficulty: "medium", duration: "20 分钟" },
  { id: "P016", title: "雅思阅读真题16", difficulty: "medium", duration: "20 分钟" },
  { id: "P017", title: "雅思阅读真题17", difficulty: "medium", duration: "20 分钟" },
  { id: "P018", title: "雅思阅读真题18", difficulty: "medium", duration: "20 分钟" },
  { id: "P019", title: "雅思阅读真题19", difficulty: "medium", duration: "20 分钟" },
  { id: "P020", title: "雅思阅读真题20", difficulty: "medium", duration: "20 分钟" },
  { id: "P021", title: "雅思阅读真题21", difficulty: "medium", duration: "20 分钟" },
  { id: "P022", title: "雅思阅读真题22", difficulty: "medium", duration: "20 分钟" },
  { id: "P023", title: "雅思阅读真题23", difficulty: "medium", duration: "20 分钟" },
  { id: "P024", title: "雅思阅读真题24", difficulty: "medium", duration: "20 分钟" },
  { id: "P025", title: "雅思阅读真题25", difficulty: "medium", duration: "20 分钟" },
  { id: "P026", title: "雅思阅读真题26", difficulty: "medium", duration: "20 分钟" },
  { id: "P027", title: "雅思阅读真题27", difficulty: "medium", duration: "20 分钟" },
  { id: "P028", title: "雅思阅读真题28", difficulty: "medium", duration: "20 分钟" },
  { id: "P029", title: "雅思阅读真题29", difficulty: "medium", duration: "20 分钟" },
  { id: "P030", title: "雅思阅读真题30", difficulty: "medium", duration: "20 分钟" },
  { id: "P031", title: "雅思阅读真题31", difficulty: "medium", duration: "20 分钟" },
  { id: "P032", title: "雅思阅读真题32", difficulty: "medium", duration: "20 分钟" },
  { id: "P033", title: "雅思阅读真题33", difficulty: "medium", duration: "20 分钟" },
  { id: "P034", title: "雅思阅读真题34", difficulty: "medium", duration: "20 分钟" },
  { id: "P035", title: "雅思阅读真题35", difficulty: "medium", duration: "20 分钟" },
  { id: "P036", title: "雅思阅读真题36", difficulty: "medium", duration: "20 分钟" },
  { id: "P037", title: "雅思阅读真题37", difficulty: "medium", duration: "20 分钟" },
  { id: "P038", title: "雅思阅读真题38", difficulty: "medium", duration: "20 分钟" },
  { id: "P039", title: "雅思阅读真题39", difficulty: "medium", duration: "20 分钟" },
  { id: "P040", title: "雅思阅读真题40", difficulty: "medium", duration: "20 分钟" },
  { id: "P041", title: "雅思阅读真题41", difficulty: "medium", duration: "20 分钟" },
  { id: "P042", title: "雅思阅读真题42", difficulty: "medium", duration: "20 分钟" },
  { id: "P043", title: "雅思阅读真题43", difficulty: "medium", duration: "20 分钟" },
  { id: "P044", title: "雅思阅读真题44", difficulty: "medium", duration: "20 分钟" },
  { id: "P045", title: "雅思阅读真题45", difficulty: "medium", duration: "20 分钟" },
  { id: "P046", title: "雅思阅读真题46", difficulty: "medium", duration: "20 分钟" },
  { id: "P047", title: "雅思阅读真题47", difficulty: "medium", duration: "20 分钟" },
  { id: "P048", title: "雅思阅读真题48", difficulty: "medium", duration: "20 分钟" },
  { id: "P049", title: "雅思阅读真题49", difficulty: "medium", duration: "20 分钟" },
  { id: "P050", title: "雅思阅读真题50", difficulty: "medium", duration: "20 分钟" },
  { id: "P051", title: "雅思阅读真题51", difficulty: "medium", duration: "20 分钟" },
]

const difficultyConfig = {
  easy: { label: "简单", className: "bg-green-100 text-green-800" },
  medium: { label: "中等", className: "bg-orange-100 text-orange-800" },
  hard: { label: "困难", className: "bg-red-100 text-red-800" },
}

export default function Page() {
  const router = useRouter()

  const handlePracticeStart = (id: string) => {
    router.push(`/quiz/${id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <h1 className="mb-6 text-2xl font-bold text-gray-900">📖 雅思阅读练习</h1>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">难度</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">建议用时</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {practices.map((practice) => (
                <tr key={practice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-500">{practice.id}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{practice.title}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyConfig[practice.difficulty].className}`}
                    >
                      {difficultyConfig[practice.difficulty].label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      ⏱️ {practice.duration}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {practices.map((practice) => (
            <div
              key={practice.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-medium text-gray-900 leading-tight">{practice.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyConfig[practice.difficulty].className}`}
                >
                  {difficultyConfig[practice.difficulty].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  ⏱️ {practice.duration}
                </span>
                <button
                  onClick={() => handlePracticeStart(practice.id)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  开始练习
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
