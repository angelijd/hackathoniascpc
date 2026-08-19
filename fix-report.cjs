const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We have two replacements to do in /api/generate-report

// 1. Fallback Mock replacement
const oldFallback = `        if (isCreativity) {
          return res.json({
            nivel: 3,
            habilidadesCognitivas: ["Pensamento Divergente", "Flexibilidade"],
            habilidadesSocioemocionais: ["Abertura ao Novo", "Tolerância à Ambiguidade"],
            pontosFortes: \`\${name}, você demonstrou excelente flexibilidade cognitiva ao reclassificar o objeto sob uma nova perspectiva que ninguém esperava!\`,
            pontosMelhoria: "Para alcançar o próximo nível, tente detalhar um pouco mais como você superaria o erro inicial do seu projeto na sua escola.",
            proximoPasso: "Na próxima tarefa, que tal tentar combinar a sua ideia com uma opinião totalmente contrária à sua para ver o que acontece?"
          });
        } else {
          return res.json({
            nivel: 3,
            habilidadesCognitivas: ["Análise de Evidências", "Metacognição"],
            habilidadesSocioemocionais: ["Autogestão", "Tolerância à Frustração"],
            pontosFortes: \`\${name}, você foi excelente ao identificar as premissas dos dois lados do conflito sem tomar decisões precipitadas na situação da sua escola em \${city}.\`,
            pontosMelhoria: "O desafio agora é explicar com mais clareza como as evidências que você escolheu sustentam a sua conclusão de forma mais estruturada.",
            proximoPasso: "Como você construiria um argumento claro, com começo, meio e fim, na próxima vez que precisar provar seu ponto de vista?"
          });
        }`;

const newFallback = `        if (isCreativity) {
          return res.json({
            nivel: 3,
            significadoNivel: "Você já consegue propor soluções bem-sucedidas e originais para problemas do cotidiano, mas o seu próximo desafio é detalhar melhor o seu processo de planejamento.",
            habilidadeCognitiva: "Pensamento Divergente",
            habilidadeSocioemocional: "Abertura ao Novo",
            habilidadeMetacognitiva: "Autorregulação",
            pontosFortes: \`Sua capacidade de propor ideias raras e reclassificar objetos sob novas perspectivas foi fantástica nesta atividade!\`,
            pontosMelhoria: "Para evoluir, tente registrar por escrito as suas hipóteses iniciais antes de avançar para a solução final.",
            proximoPasso: "Na próxima aula, que tal tentar unir duas ideias que parecem opostas e criar uma solução unificada com elas?"
          });
        } else {
          return res.json({
            nivel: 3,
            significadoNivel: "Você consegue separar premissas de conclusões de forma lógica e demonstra mente aberta ao considerar pontos de vista contrários.",
            habilidadeCognitiva: "Avaliação de Evidências",
            habilidadeSocioemocional: "Mente Aberta",
            habilidadeMetacognitiva: "Autorregulação",
            pontosFortes: \`\${name}, você foi excelente ao identificar as premissas dos dois lados do conflito sem tomar decisões precipitadas na situação da sua escola em \${city}.\`,
            pontosMelhoria: "O desafio agora é explicar com mais clareza como as evidências que você escolheu sustentam a sua conclusão de forma mais estruturada.",
            proximoPasso: "Como você construiria um argumento claro, com começo, meio e fim, na próxima vez que precisar provar seu ponto de vista?"
          });
        }`;

code = code.replace(oldFallback, newFallback);

const oldPromptsRegex = /const promptCriticalThinking = `\n# PAPEL E CONTEXTO[\s\S]*?\n} \/\/ Array de 2 strings curtas\n`;/g;
// Wait, I will just run my previous patch script over it, but modified to target the LAST occurrence.
fs.writeFileSync('server.ts', code);
