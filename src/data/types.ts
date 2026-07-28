export type ChapterId =
  | 'romanitatea'
  | 'autonomii'
  | 'stat-modern'
  | 'constitutii'
  | 'postbelica'
  | 'relatii-int';

export interface Question {
  id: string;
  chapterId: ChapterId;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export interface Chapter {
  id: ChapterId;
  title: string;
  icon: string;
  iconActive: string;
  blurb: string;
}
