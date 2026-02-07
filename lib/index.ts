// lib/index.ts

export type ReadingMeta = {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    timeLimit: number;
  };
  
  // 获取所有题目列表（读取刚才生成的 reading-list.json）
  export async function getReadingList(): Promise<ReadingMeta[]> {
    // 注意：路径是 /data/reading-list.json，对应 public/data/
    const response = await fetch("/data/reading-list.json");
    if (!response.ok) {
      throw new Error("Failed to fetch reading list");
    }
    return response.json();
  }
  
  // 获取单篇题目的详细内容（例如 1.json）
  export async function getReadingById(id: string) {
    // 注意：路径是 /data/1.json，对应 public/data/1.json
    const response = await fetch(`/data/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reading ${id}`);
    }
    return response.json();
  }