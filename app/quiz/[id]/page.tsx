import fs from 'fs/promises';
import path from 'path';
import ReadingQuiz from '@/components/ReadingQuiz';
import type { QuestionType } from '@/types/quiz';

type PassageFromFile = {
  id: string;
  title: string;
  difficulty: string;
  timeLimit: number;
  passageContent: string;
  questions: Array<{
    id: string;
    type: string;
    stem: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    context?: string;
    nextContext?: string;
    groupId?: string;
  }>;
};

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), 'public', 'data', `${id}.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data: PassageFromFile = JSON.parse(fileContent);

    const paragraphs = data.passageContent
      .split('\n\n')
      .filter((p) => p.trim())
      .map((content, index) => ({
        label: String.fromCharCode(65 + index),
        content: content.trim(),
      }));

    const passage = {
      title: data.title,
      paragraphs,
    };

    const normalizeTfng = (v: string): 'T' | 'F' | 'NG' => {
      const u = v.toUpperCase().trim();
      if (u === 'TRUE') return 'T';
      if (u === 'FALSE') return 'F';
      if (u === 'NOT GIVEN' || u === 'NG') return 'NG';
      return v as 'T' | 'F' | 'NG';
    };

    // 使用 QuestionType[]：仅将 type "filling" 规范为 "fillblank"，保留 id、stem、context 等
    const questions: QuestionType[] = data.questions.map((q) => {
      const type = q.type === 'filling' ? 'fillblank' : (q.type as 'choice' | 'tfng' | 'fillblank');
      const base = {
        id: q.id,
        stem: q.stem,
        options: q.options ?? [],
        correctAnswer: type === 'tfng' ? normalizeTfng(q.correctAnswer) : q.correctAnswer,
        explanation: q.explanation,
      };
      if (type === 'fillblank') {
        return {
          ...base,
          type: 'fillblank' as const,
          context: q.context ?? '',
          nextContext: q.nextContext,
        };
      }
      return {
        ...base,
        type,
        ...(q.groupId != null && { groupId: q.groupId }),
      };
    });

    return (
      <div className="min-h-screen bg-background">
        <ReadingQuiz passage={passage} questions={questions} />
      </div>
    );
  } catch (error) {
    console.error("读取文件错误:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404 Not Found</h1>
          <p className="text-muted-foreground">
            找不到 ID 为 <strong>{id}</strong> 的文章。<br />
            请确认 public/data 文件夹里是否有 {id}.json 文件。
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-4">
              错误详情: {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </div>
      </div>
    );
  }
}