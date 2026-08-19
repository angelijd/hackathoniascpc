const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I need to replace the FIRST occurrence of promptCriticalThinking and promptCreativity
// Since my bad patch replaced the first occurrence with the REPORT prompts, 
// the first occurrence is currently the REPORT prompt!
// I need to replace that with a QUESTIONS prompt.

const questionsPrompt = `      const promptCriticalThinking = \`Você é um avaliador do Instituto Ayrton Senna.
Gere 5 perguntas de Pensamento Crítico para um estudante chamado \${name}, idade \${age}, do \${grade}, que estuda em \${school}, e se interessa por: \${interests.join(', ')}.
As perguntas devem explorar situações cotidianas ou escolares baseadas nesses interesses, exigindo que o aluno analise argumentos, avalie evidências, e evite o viés de confirmação.

Regras:
- Retorne EXATAMENTE 5 perguntas.
- Formato obrigatório (lista numerada pura):
1. [Pergunta 1]
2. [Pergunta 2]
3. [Pergunta 3]
4. [Pergunta 4]
5. [Pergunta 5]\`;

      const promptCreativity = \`Você é um avaliador do Instituto Ayrton Senna.
Gere 5 perguntas de Criatividade para um estudante chamado \${name}, idade \${age}, do \${grade}, que estuda em \${school}, e se interessa por: \${interests.join(', ')}.
As perguntas devem propor desafios práticos baseados nesses interesses, exigindo que o aluno pense de forma divergente, proponha múltiplas ideias e supere a frustração.

Regras:
- Retorne EXATAMENTE 5 perguntas.
- Formato obrigatório (lista numerada pura):
1. [Pergunta 1]
2. [Pergunta 2]
3. [Pergunta 3]
4. [Pergunta 4]
5. [Pergunta 5]\`;`;

const regex = /const promptCriticalThinking = `[\s\S]*?`;\s*const promptCreativity = `[\s\S]*?`;/;
// This will replace the FIRST occurrence (which I broke) with the fix.
code = code.replace(regex, questionsPrompt);
fs.writeFileSync('server.ts', code);
