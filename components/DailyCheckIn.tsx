"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "ielts-streak"

type StreakData = {
  streak: number
  lastCheckInDate: string
}

type LeaderboardEntry = {
  id: string
  name: string
  streak: number
  isMe?: boolean
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: "alex", name: "Alex", streak: 120 },
  { id: "sarah", name: "Sarah", streak: 95 },
  { id: "mike", name: "Mike", streak: 78 },
  { id: "emma", name: "Emma", streak: 56 },
]

function getToday(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function loadStreak(): StreakData {
  if (typeof window === "undefined") return { streak: 0, lastCheckInDate: "" }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { streak: 0, lastCheckInDate: "" }
    const data = JSON.parse(raw) as StreakData
    return {
      streak: typeof data.streak === "number" ? data.streak : 0,
      lastCheckInDate: typeof data.lastCheckInDate === "string" ? data.lastCheckInDate : "",
    }
  } catch {
    return { streak: 0, lastCheckInDate: "" }
  }
}

function saveStreak(data: StreakData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export default function DailyCheckIn() {
  const [streak, setStreak] = useState(0)
  const [lastCheckInDate, setLastCheckInDate] = useState("")
  const [message, setMessage] = useState<"success" | "already" | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const data = loadStreak()
    setStreak(data.streak)
    setLastCheckInDate(data.lastCheckInDate)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (message === null) return
    const t = setTimeout(() => setMessage(null), 2500)
    return () => clearTimeout(t)
  }, [message])

  const handleCheckIn = () => {
    const today = getToday()
    const yesterday = getYesterday()

    if (lastCheckInDate === today) {
      setMessage("already")
      return
    }

    let newStreak: number
    if (lastCheckInDate === yesterday) {
      newStreak = streak + 1
    } else {
      newStreak = 1
    }

    const next: StreakData = { streak: newStreak, lastCheckInDate: today }
    saveStreak(next)
    setStreak(newStreak)
    setLastCheckInDate(today)
    setMessage("success")
  }

  const leaderboardList: LeaderboardEntry[] = mounted
    ? [
        ...MOCK_LEADERBOARD,
        { id: "me", name: "我", streak, isMe: true },
      ]
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5)
    : [...MOCK_LEADERBOARD].sort((a, b) => b.streak - a.streak).slice(0, 5)

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md">
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-indigo-900">
            🔥 每日打卡
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              连续 {mounted ? streak : "—"} 天
            </span>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={!mounted}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              打卡
            </button>
          </div>
        </div>

        {message !== null && (
          <p
            className={`mb-3 text-sm font-medium ${
              message === "success" ? "text-green-700" : "text-amber-700"
            }`}
          >
            {message === "success" ? "打卡成功！" : "今天已经打过啦"}
          </p>
        )}

        <div className="rounded-lg border border-indigo-100 bg-white/80 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600/80">
            排行榜 Top 5
          </p>
          <ul className="space-y-1.5">
            {leaderboardList.map((entry, index) => (
              <li
                key={entry.id}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                  entry.isMe ? "bg-indigo-100 font-medium text-indigo-900" : "text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 text-center text-indigo-500 font-semibold">
                    {index + 1}
                  </span>
                  <span>{entry.name}</span>
                  {entry.isMe && (
                    <span className="rounded bg-indigo-200 px-1.5 py-0.5 text-xs text-indigo-800">
                      我
                    </span>
                  )}
                </span>
                <span className="font-medium text-indigo-700">
                  {entry.streak} 天
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
