import { InterestOption, ExpectationOption } from '../types';

export const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'musica', label: 'Música', icon: '🎵' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'esportes', label: 'Esportes', icon: '⚽' },
  { id: 'desenho', label: 'Desenho', icon: '✏️' },
  { id: 'filmes', label: 'Filmes e séries', icon: '🎬' },
  { id: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { id: 'animais', label: 'Animais', icon: '🐾' },
  { id: 'cozinhar', label: 'Cozinhar', icon: '👨‍🍳' },
  { id: 'viajar', label: 'Viajar', icon: '✈️' },
  { id: 'ler', label: 'Ler', icon: '📖' },
];

export const EXPECTATION_OPTIONS: ExpectationOption[] = [
  { id: 'conhecer', label: 'Me conhecer melhor', icon: '💖' },
  { id: 'ideias', label: 'Desenvolver minhas ideias', icon: '💡' },
  { id: 'desafio', label: 'Ter um desafio diferente', icon: '🏔️' },
  { id: 'nao-sei', label: 'Não sei', icon: '❓' },
];
