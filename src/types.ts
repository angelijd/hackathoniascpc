export interface FeatureItem {
  id: string;
  badgeClass: string;
  badgeBg: string;
  iconType: 'questions' | 'ai' | 'report';
  title: string;
  description: string;
}

export interface Question {
  id: number;
  type: 'multiple-choice' | 'open-ended';
  category: 'Pensamento Crítico' | 'Criatividade' | 'Resolução de Problemas';
  title: string;
  scenario: string;
  options?: {
    id: string;
    text: string;
    aiFeedback: string;
  }[];
  placeholder?: string;
}

export interface InterestOption {
  id: string;
  label: string;
  icon: string;
}

export interface ExpectationOption {
  id: string;
  label: string;
  icon: string;
}

export type ScreenStep = 'welcome' | 'preferences' | 'test_selection' | 'assessment';
