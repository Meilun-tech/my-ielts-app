import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export type ReadingListItem = {
  id: string
  title: string
  difficulty: string
  timeLimit: number
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "public", "data")
    const files = fs.readdirSync(dataDir)
    const jsonFiles = files.filter(
      (f) => f.endsWith(".json") && f !== "reading-list.json"
    )
    const list: ReadingListItem[] = []
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(dataDir, file)
        const raw = fs.readFileSync(filePath, "utf-8")
        const data = JSON.parse(raw) as {
          id?: string
          title?: string
          difficulty?: string
          timeLimit?: number
        }
        const id = data.id ?? file.replace(/\.json$/i, "")
        const title = data.title ?? ""
        const difficulty = data.difficulty ?? "Medium"
        const timeLimit =
          typeof data.timeLimit === "number" ? data.timeLimit : 20
        list.push({ id, title, difficulty, timeLimit })
      } catch {
        // skip invalid json
      }
    }
    list.sort((a, b) => String(a.id).localeCompare(String(b.id)))
    return NextResponse.json(list)
  } catch (err) {
    console.error("reading-list API error:", err)
    return NextResponse.json(
      { error: "Failed to read reading list" },
      { status: 500 }
    )
  }
}
