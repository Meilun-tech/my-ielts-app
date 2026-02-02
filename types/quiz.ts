export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard'; // 刚改 1：统一 Difficulty 的取值

export type QuestionKind = 'choice' | 'tfng' | 'fillblank';

/** 选择题、T/F/NG 题共用：无 context */
export interface ChoiceOrTfngQuestion {
  id: string;
  type: 'choice' | 'tfng';
  stem: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  context?: string;
  /** 多选题组判分：同一组的题目共享同一 groupId，判分时按集合对比（顺序无关） */
  groupId?: string;
}

/** 填空题：必有 context（完整句子/段落，可用 _____ 标记空格） */
export interface FillblankQuestion {
  id: string;
  type: 'fillblank';
  stem: string;
  options: string[];
  context: string;
  nextContext?: string;
  correctAnswer: string;
  explanation: string;
}

export type QuestionType = ChoiceOrTfngQuestion | FillblankQuestion;

export interface Passage {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // 删改 2：统一 Difficulty 的取值
  passageContent: string;
  questions: QuestionType[];
}