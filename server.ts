import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const { name, age, grade, city, school, interests, testType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isCreativity = testType === 'creativity';
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback mock questions for testing the UI without an API key
        const i1 = interests[0] || 'seus interesses';
        const i2 = interests[1] || i1;
        const i3 = interests[2] || i1;
        
        let fallbackQuestions = [];
        
        if (isCreativity) {
          fallbackQuestions = [
            `${name}, imagine que a prefeitura de ${city} quer criar um novo espaço perto da ${school} para estimular a imaginação dos jovens, mas o local atual é cinza e sem graça. Como o ambiente afeta sua vontade de criar e o que você faria para transformar esse lugar?`,
            `Pense no seu dia a dia e na sua paixão por ${i1}. Qual foi a ideia mais simples e criativa que você teve recentemente para resolver um problema comum e como você se sentiu ao colocá-la em prática?`,
            `Se você tivesse que inventar 5 usos totalmente diferentes e fora do comum para um objeto relacionado a ${i2}, quais seriam?`,
            `Conte sobre uma experiência recente na qual você tentou criar algo diferente, mas a sua ideia não deu certo. Como você lidou com a frustração desse erro e tentou novamente?`,
            `Imagine que você e seus amigos do ${grade} precisam organizar um evento sobre ${i3}, mas ninguém sabe direito o que fazer e as opiniões são muito diferentes. Como você lidaria com essa confusão sem perder a calma e a criatividade?`
          ];
        } else {
          fallbackQuestions = [
            `${name}, imagine que a prefeitura de ${city} quer proibir o uso de celulares na ${school} para melhorar o foco, mas alguns alunos dizem que usam para pesquisar sobre ${i1}. Como você analisaria os argumentos dos dois lados sem deixar sua emoção falar mais alto?`,
            `Pense em uma situação em que você teve que tomar uma decisão difícil envolvendo seus amigos do ${grade} e sua paixão por ${i2}. Como você lidou com o conflito entre o que você sentia e o que a lógica dizia ser o certo?`,
            `Sendo um estudante de ${age}, é comum a gente buscar informações que só confirmam o que já pensamos sobre ${i3}. Como você faria para não cair nessa armadilha e ser honesto consigo mesmo ao ouvir uma opinião contrária?`,
            `Imagine que você precisa convencer a direção da ${school} a criar um clube focado em ${i1}. Como você construiria um argumento claro, com começo, meio e fim, para provar que isso seria bom para todos?`,
            `Você aprendeu a testar ideias nas aulas do ${grade}. Como você usaria esse mesmo raciocínio passo a passo para resolver um problema real que você observa hoje em ${city}?`
          ];
        }
        
        // Small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        return res.json({ questions: fallbackQuestions });
      }

      const ai = new GoogleGenAI({ apiKey });

                  const promptCriticalThinking = `Você é um avaliador do Instituto Ayrton Senna.
Gere 5 perguntas de Pensamento Crítico para um estudante chamado ${name}, idade ${age}, do ${grade}, que estuda em ${school}, e se interessa por: ${interests.join(', ')}.
As perguntas devem explorar situações cotidianas ou escolares baseadas nesses interesses, exigindo que o aluno analise argumentos, avalie evidências, e evite o viés de confirmação.

Regras:
- Retorne EXATAMENTE 5 perguntas.
- Formato obrigatório (lista numerada pura):
1. [Pergunta 1]
2. [Pergunta 2]
3. [Pergunta 3]
4. [Pergunta 4]
5. [Pergunta 5]`;

      const promptCreativity = `# Context

**Você é um avaliador do Instituto Ayrton Senna.**

# role 

**Gere 5 perguntas de Criatividade para um estudante chamado ${name}, idade ${age}, do ${grade}, que estuda em ${school}, e se interessa por: ${interests.join(', ')}.**

**As perguntas devem propor desafios práticos baseados nesses interesses, exigindo que o aluno pense de forma divergente, proponha múltiplas ideias e supere a frustração.**

# mandatory rules

**\- Retorne EXATAMENTE 5 perguntas.**

**\- Formato obrigatório (lista numerada pura):**

**1\. \[Pergunta 1\]**

**2\. \[Pergunta 2\]**

**3\. \[Pergunta 3\]**

**4\. \[Pergunta 4\]**

**5\. \[Pergunta 5\]\`**

## DIRETRIZES OBRIGATÓRIAS:

1. **Linguagem super simples:** Use palavras do cotidiano. Escreva frases curtas e diretas. O tom deve ser de uma conversa amigável.  
2. **Ação Única:** O enunciado deve ser muito claro e pedir **apenas uma coisa** ao aluno (uma história, uma ideia ou uma reflexão). Não faça perguntas múltiplas. ex negativo ‘Ayrton, você encontrou uma resenha na biblioteca da Escola Estadual Dr. Ytrio Correia afirmando que "livros clássicos não têm utilidade para os jovens do 9º ano porque tratam de realidades distantes". Como leitor, de que forma você analisaria a validade desse argumento e quais evidências buscaria antes de decidir se concorda ou discorda dessa afirmação?’ ex positivo ‘Ayrton, você encontrou uma resenha na biblioteca da Escola Dr. Ytrio Correia afirmando que "livros antigos não têm utilidade para os jovens porque tratam de realidades distantes". Como leitor, você concorda ou discorda? Por quê?’  
3. **Excesso de referências**: mencionar apenas dois itens entre nome, ano letivo, escola e interesses para evitar sobrecarga de referências e alongar as perguntas.  
4. **Jornada do Estudante:** O foco é 100% no desenvolvimento pessoal do aluno. **É proibido incluir qualquer tipo de competição, notas, ranking ou comparação com outros alunos.**  
5. **Sem Certo ou Errado:** Deixe claro na forma de perguntar que não existe resposta certa ou errada. O que importa é como o aluno pensa e sente.  
6. **Essência da Avaliação:** Você deve usar o contexto do aluno para criar a pergunta, mas a habilidade avaliada em cada questão deve permanecer exatamente a mesma das perguntas-base.  
7. **Sem teoria:** não inclua teorias na pergunta. 

## PERGUNTAS-BASE (O que deve ser avaliado):

1. **Ambiente e Processo Criativo:** Avaliar se o aluno percebe como o ambiente afeta sua criatividade e se consegue propor melhorias. (Use a escola ou a cidade no cenário).  
2. **Criatividade no Cotidiano:** Avaliar a valorização de pequenas ideias criativas do dia a dia (mini-c), promovendo a autoconsciência. (Use um dos interesses no cenário).  
3. **Pensamento Divergente:** Avaliar a fluência e originalidade. O aluno deve pensar em várias ideias diferentes e fora do comum para um mesmo elemento. (Use um dos interesses no cenário).  
4. **Aprendizado com o Erro (Resiliência):** Avaliar a imaginação criativa lidando com a frustração e o erro ao tentar algo novo.  
5. **Tolerância à Incerteza (Ambiguidade):** Avaliar a capacidade de manter a mente aberta e pensar de forma fluida em uma situação confusa, de conflito ou sem resposta clara.

# FORMATO DE SAÍDA (OUTPUT)

Gere apenas as 5 perguntas numeradas, sem introduções teóricas. Escreva conversando diretamente com o aluno, integrando os dados dele de forma muito natural.`;

      const prompt = isCreativity ? promptCreativity : promptCriticalThinking;

      let response;
      let retries = 5;
      let delay = 4000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
          });
          break;
        } catch (err: any) {
          if (err?.status === 'UNAVAILABLE' || err?.message?.includes('503')) {
            retries--;
            if (retries === 0) throw err;
            console.log(`High demand in generate-questions, retrying in 2000ms...`);
            await new Promise(res => setTimeout(res, 2000));
          } else {
            console.log('Switching to mock questions.');
            throw err;
          }
        }
      }

      const text = response?.text || '';
      
      // Parse the numbered output into an array of strings
      const lines = text.split('\n');
      const questions = [];
      let currentQuestion = '';

      for (const line of lines) {
        if (/^\d+\./.test(line.trim())) {
          if (currentQuestion) {
            questions.push(currentQuestion.trim());
          }
          currentQuestion = line.replace(/^\d+\.\s*/, '');
        } else if (line.trim() !== '') {
          currentQuestion += ' ' + line.trim();
        }
      }
      if (currentQuestion) {
        questions.push(currentQuestion.trim());
      }

      // If parsing fails for some reason, fallback
      if (questions.length === 0) {
        questions.push(text);
      }

      res.json({ questions: questions.slice(0, 5) });
    } catch (error: any) {
      console.log('Serving mock questions.');
      const name = req.body.name || 'Estudante';
      const interests = req.body.interests || [];
      const mockQuestions = [
        `1. ${name}, pensando nos seus interesses, como você resolveria um desafio comum no seu dia a dia?`,
        `2. Descreva um momento em que você precisou mudar de ideia sobre algo importante.`,
        `3. O que você faria em uma situação em que não existe uma resposta certa clara?`,
        `4. Qual é a sua forma favorita de exercitar a criatividade?`,
        `5. Conte como você lidou com a frustração ao tentar aprender algo novo recentemente.`
      ];
      res.json({ questions: mockQuestions });
    }
  });

  // API Route for Gemini Report
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { name, age, grade, city, school, interests, questions, answers, testType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isCreativity = testType === 'creativity';
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback mock report
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isCreativity) {
          return res.json({
            nivel: 3,
            significadoNivel: "Você já consegue propor soluções bem-sucedidas e originais para problemas do cotidiano, mas o seu próximo desafio é detalhar melhor o seu processo de planejamento.",
            habilidadeCognitiva: "Pensamento Divergente",
            habilidadeSocioemocional: "Abertura ao Novo",
            habilidadeMetacognitiva: "Autorregulação",
            pontosFortes: `Sua capacidade de propor ideias raras e reclassificar objetos sob novas perspectivas foi fantástica nesta atividade!`,
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
            pontosFortes: `${name}, você foi excelente ao identificar as premissas dos dois lados do conflito sem tomar decisões precipitadas na situação da sua escola em ${city}.`,
            pontosMelhoria: "O desafio agora é explicar com mais clareza como as evidências que você escolheu sustentam a sua conclusão de forma mais estruturada.",
            proximoPasso: "Como você construiria um argumento claro, com começo, meio e fim, na próxima vez que precisar provar seu ponto de vista?"
          });
        }
      }

      const ai = new GoogleGenAI({ apiKey });

      const promptCriticalThinking = `
# CONTEXTO TEÓRICO: O MODELO DE PENSAMENTO CRÍTICO NO SÉCULO XXI
O pensamento crítico é um processo intencional, racional, autorregulado e híbrido. Ele não se limita a "criticar", mas envolve o julgamento lógico sobre em que acreditar ou como agir, integrando habilidades cognitivas de alto nível e atitudes socioemocionais.

Você deve utilizar as definições operacionais abaixo para analisar a resposta do estudante.

---

## DIMENSÃO 1: COGNITIVA (HABILIDADES DE FACIONE / APA)
Mede as operações intelectuais de processamento de informações e estruturação lógica.
- 1.1 Interpretação: Capacidade de compreender e expressar o significado de dados, juízos, regras e convenções de forma clara.
- 1.2 Análise: Habilidade de desconstruir o argumento alheio, identificando a relação pretendida entre as premissas, as evidências e a conclusão real.
- 1.3 Avaliação: Capacidade de julgar a credibilidade das fontes, a força lógica dos argumentos e a presença de falácias ou inconsistências.
- 1.4 Inferência: Capacidade de identificar elementos necessários para deduzir consequências lógicas, formular hipóteses válidas e extrair conclusões sustentáveis.
- 1.5 Explicação: Capacidade de apresentar os resultados do próprio raciocínio de forma clara, coerente, estruturada e justificada.

---

## DIMENSÃO 2: SOCIOEMOCIONAL (DISPOSIÇÕES E ATITUDES CRÍTICAS)
Mede as características de personalidade que sustentam a aplicação das habilidades cognitivas na prática.
- 2.1 Abertura ao Novo (Mente Aberta): Disposição para considerar pontos de vista contrários de forma honesta, tolerando perspectivas divergentes.
- 2.2 Curiosidade para Aprender (Busca da Verdade): Atitude inquisitiva, desejo de buscar informações fundamentadas em vez de aceitar respostas fáceis.
- 2.3 Honestidade Intelectual e Autogestão: Coragem para enfrentar os próprios preconceitos e reconhecer quando as próprias evidências são fracas.
- 2.4 Tolerância à Ambiguidade e Resiliência: Capacidade de suspender o julgamento, mantendo-se calmo e sem tomar decisões precipitadas sob forte pressão emocional ou diante de dados contraditórios.

---

## DIMENSÃO 3: METACOGNITIVA
- Autorregulação: Habilidade metacognitiva de monitorar o próprio pensamento, identificar os próprios vieses cognitivos e corrigir os próprios erros de julgamento.

# PAPEL E CONTEXTO
Você é um avaliador especialista em Pensamento Crítico e Competências Socioemocionais, treinado sob o Modelo de Facione (APA) e as diretrizes de avaliação formativa do Instituto Ayrton Senna. Sua função é analisar respostas dissertativas de estudantes e fornecer um diagnóstico de nível de desenvolvimento e um feedback formativo construtivo.

# TAREFA
Avalie a resposta do estudante de acordo com as rubricas de pensamento crítico multidimensional abaixo.

# RUBRICAS GERAIS DE DESEMPENHO (1 a 4)

- NÍVEL 1: INSUFICIENTE (Pensamento Opinativo)
  * Critério: Resposta puramente baseada em crenças pessoais, emoções ou dogmas. O estudante não desconstrói o problema, ignora dados factuais, usa termos vagos, assume uma única verdade sem justificativa lógica e apresenta forte viés de confirmação.

- NÍVEL 2: BÁSICO (Análise Linear)
  * Critério: O estudante tenta argumentar de forma lógica, mas aceita evidências sem verificar sua força ou credibilidade. Consegue identificar conceitos básicos, mas falha em analisar pontos de vista contrários de forma neutra, caindo em dualismos simples (certo/errado, bom/mau) e premissas implícitas frágeis.

- NÍVEL 3: PROFICIENTE (Análise Crítica e Isenção)
  * Critério: Demonstra habilidades claras de pensamento crítico. Desconstrói argumentos separando premissas de conclusões de forma lógica. Mostra "mente aberta" ao considerar pontos de vista contrários de forma imparcial (suspensão de julgamento) e avalia criticamente a força das evidências apresentadas.

- NÍVEL 4: AVANÇADO (Metacognição e Autorregulação)
  * Critério: Além de cumprir o nível proficiente, o estudante monitora ativamente seu próprio pensamento. Identifica e assume seus próprios vieses (ex: viés de confirmação), demonstra honestidade intelectual para revisar posições e explica com clareza cirúrgica a articulação metodológica e os critérios lógicos por trás de suas conclusões.

# INSTRUÇÕES DE FEEDBACK FORMATIVO (Foco em Mindset de Crescimento)
O feedback deve situar o estudante em sua progressão de aprendizagem através de três seções:
1. Pontos Fortes (Feed Up): Onde o aluno demonstrou isenção, lógica, desconstrução de argumentos ou suspensão de julgamento.
2. Oportunidades de Melhoria (Feed Back): Onde houve fragilidade na consistência das premissas, falácias não percebidas ou influência de vieses de confirmação.
3. Próximo Passo Reflexivo (Feed Forward): Uma pergunta instigadora que o desafie a monitorar seu pensamento ou testar uma nova estratégia na próxima análise de cenário.

# DADOS DE ENTRADA DO CASO
Nome: ${name}, Idade: ${age}, Ano: ${grade}, Escola: ${school}, Interesses: ${interests.join(', ')}

PERGUNTAS E RESPOSTAS DO ALUNO:
${questions.map((q, i) => `Q${i+1}: ${q}\nR${i+1}: ${answers[i]}`).join('\n\n')}

# FORMATO DE SAÍDA ESPERADO
Responda ESTRITAMENTE num formato JSON válido com as seguintes chaves exatas (sem formatação markdown por fora):
{
  "nivel": 3,
  "significadoNivel": "Descrição qualitativa do nível alcançado pelo estudante",
  "habilidadeCognitiva": "Nome da principal habilidade cognitiva avaliada",
  "habilidadeSocioemocional": "Nome da principal habilidade socioemocional",
  "habilidadeMetacognitiva": "Autorregulação",
  "pontosFortes": "Feedback sobre as forças (Feed Up)",
  "pontosMelhoria": "Feedback focado na lacuna de aprendizagem (Feed Back)",
  "proximoPasso": "Desafio ou pergunta reflexiva (Feed Forward)"
}
`;

      const promptCreativity = `
# CONTEXTO TEÓRICO: O MODELO DE CRIATIVIDADE NO SÉCULO XXI
A criatividade avaliada nesta atividade não é um talento místico ou apenas expressão artística; ela é um constructo multidimensional e uma competência híbrida que integra três dimensões: Cognitiva, Metacognitiva e Socioemocional.

Você deve utilizar estritamente as definições operacionais abaixo para analisar a resposta do estudante.

---

## DIMENSÃO 1: COGNITIVA (PENSAMENTO DIVERGENTE E RACIOCÍNIO FLUIDO)
Mede a habilidade do estudante de gerar ideias novas, úteis e estruturadas para resolver problemas não rotineiros.
- 1.1 Fluência Associativa: Capacidade de gerar uma grande quantidade de ideias ou caminhos alternativos diante de um estímulo ou problema.
- 1.2 Flexibilidade e Reclassificação: Capacidade de mudar de perspectiva, abandonar abordagens óbvias e reclassificar objetos ou ideias para funções completamente novas.
- 1.3 Originalidade: Capacidade de propor soluções singulares, raras, inesperadas ou estatisticamente incomuns para o grupo de referência.
- 1.4 Raciocínio Fluido (Gf): Habilidade de identificar padrões lógicos, deduzir regras implícitas e estruturar soluções consistentes em cenários de alta incerteza e ambiguidade.

---

## DIMENSÃO 2: METACOGNITIVA (AUTORREGULAÇÃO E AUTOCONSCIÊNCIA)
Mede a capacidade do estudante de monitorar, avaliar e refletir sobre o seu próprio processo criativo.
- 2.1 Autoconsciência de Sentimentos e Interesses: Habilidade do estudante de identificar suas próprias motivações, emoções e valores durante o processo de criação.
- 2.2 Autorregulação e Monitoramento: Habilidade de planejar a execução de uma ideia, monitorar o progresso em relação ao objetivo, identificar desvios e reajustar a rota.
- 2.3 Avaliação de Produto: Capacidade de olhar para a própria solução final de forma crítica e julgar sua real viabilidade, qualidade e utilidade prática.

---

## DIMENSÃO 3: SOCIOEMOCIONAL (ABERTURA AO NOVO E AUTOGESTÃO)
Mede as disposições de personalidade e atitudes que sustentam e impulsionam o comportamento criativo.
- 3.1 Imaginação Criativa (Abertura ao Novo): Disposição para gerar ideias livres, brincar com conceitos, experimentar o incomum e enxergar o erro não como fracasso.
- 3.2 Curiosidade para Aprender (Abertura ao Novo): Mentalidade inquisitiva, desejo ativo de explorar o desconhecido, fazer perguntas profundas.
- 3.3 Sensibilidade Estética (Abertura ao Novo): Capacidade de valorizar e conectar-se com o design, a arte, a beleza.
- 3.4 Persistência e Determinação (Autogestão): Capacidade de manter o esforço ativo na tarefa, superando bloqueios criativos.
- 3.5 Tolerância à Ambiguidade (Resiliência Emocional): Capacidade de se manter calmo, focado e produtivo mesmo quando as instruções são vagas.

---

# DIRETRIZES DE PONTUAÇÃO (ÂNCORAS DE DESEMPENHO)
Ao atribuir um nível de proficiência (1 a 4), busque estas evidências textuais na resposta do estudante:

### NÍVEL 1: INSUFICIENTE (Pensamento Linear/Bloqueio)
- Evidências cognitivas: Apresenta apenas uma ideia, óbvia ou copiada.
- Evidências socioemocionais: Demonstra apatia, recusa-se a arriscar ou medo de errar.
- Evidências metacognitivas: Ausência total de reflexão.

### NÍVEL 2: BÁSICO (Criatividade Linear e Cotidiana)
- Evidências cognitivas: Sugere soluções funcionais comuns.
- Evidências socioemocionais: Curiosidade básica, prefere caminhos seguros.
- Evidências metacognitivas: Relata o que fez, mas não avalia criticamente.

### NÍVEL 3: PROFICIENTE (Pensamento Divergente e Híbrido Ativo)
- Evidências cognitivas: Múltiplas ideias e reclassifica conceitos.
- Evidências socioemocionais: Imaginação criativa ativa, relata erro como parte do processo.
- Evidências metacognitivas: Autoconsciência das emoções e monitora o avanço.

### NÍVEL 4: AVANÇADO (Inovação, Síntese e Metacognição Excelente)
- Evidências cognitivas: Altamente original, une elementos desconexos.
- Evidências socioemocionais: Alta tolerância à ambiguidade.
- Evidências metacognitivas: Descreve com precisão a estratégia de pensamento.

# DADOS DE ENTRADA DO CASO
Nome: ${name}, Idade: ${age}, Ano: ${grade}, Escola: ${school}, Interesses: ${interests.join(', ')}

PERGUNTAS E RESPOSTAS DO ALUNO:
${questions.map((q, i) => `Q${i+1}: ${q}\nR${i+1}: ${answers[i]}`).join('\n\n')}

# FORMATO DE SAÍDA ESPERADO
Responda ESTRITAMENTE num formato JSON válido com as seguintes chaves exatas (sem formatação markdown por fora):
{
  "nivel": 3,
  "significadoNivel": "Descrição qualitativa do nível alcançado",
  "habilidadeCognitiva": "Pensamento Divergente",
  "habilidadeSocioemocional": "Abertura ao Novo",
  "habilidadeMetacognitiva": "Autorregulação",
  "pontosFortes": "O que o estudante fez bem (Feed Up)",
  "pontosMelhoria": "Onde o estudante falhou ou deixou lacunas lógicas (Feed Back)",
  "proximoPasso": "Uma pergunta reflexiva ou provocação prática (Feed Forward)"
}
`;

      const prompt = isCreativity ? promptCreativity : promptCriticalThinking;

      let response;
      let retries = 5;
      let delay = 4000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          break;
        } catch (err: any) {
          if (err?.status === 'UNAVAILABLE' || err?.message?.includes('503')) {
            retries--;
            if (retries === 0) throw err;
            console.log(`High demand in generate-report, retrying in 2000ms...`);
            await new Promise(res => setTimeout(res, 2000));
          } else {
            console.log('Switching to mock report.');
            throw err;
          }
        }
      }

      const jsonText = response?.text || "{}";
      let result;
      try {
        result = JSON.parse(jsonText);
      } catch(e) {
        result = { 
          nivel: 2, 
          habilidadesCognitivas: ["Análise", "Lógica"],
          habilidadesSocioemocionais: ["Foco", "Resiliência"],
          pontosFortes: "Não foi possível analisar detalhadamente.", 
          pontosMelhoria: "Ocorreu um erro no processamento das respostas.",
          proximoPasso: "Tente novamente."
        };
      }
      return res.json(result);
    } catch (error: any) {
      console.log('Serving mock report.');
      res.json({
        nivel: 2,
        habilidadesCognitivas: ["Análise", "Criatividade"],
        habilidadesSocioemocionais: ["Foco", "Resiliência"],
        pontosFortes: "Sistema em alta demanda. Demonstrou ótima dedicação em completar o teste!",
        pontosMelhoria: "A análise detalhada com IA não pôde ser concluída neste momento.",
        proximoPasso: "Revisite suas respostas depois e veja se você mudaria alguma coisa."
      });
    }
  });

  // API Route for Béco Chat
  app.post('/api/beco-chat', async (req, res) => {
    try {
      const { question, userMessage, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        return res.json({
          response: "E aí parça! Papo reto, tô aqui sem a chave da API 💀 Mas foca nessa pergunta aí e manda ver, tamo junto!",
          chips: ["Me explica de outro jeito?", "Quero uma pista", "Por que isso importa?"]
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Role: Tutor Gen Z ("Soca"). Use tom amigável e gírias leves de 2020 ("papo reto", "tamo junto").
Mission: Guiar o estudante usando Raciocínio Socrático para responder à seguinte pergunta do teste:
"${question}"

Rules:
1. Nunca dê a resposta pronta. Faça perguntas reflexivas que guiem o pensamento.
2. Se o aluno não entender, reescreva a pergunta com palavras simples e jovem.
3. Corrija erros de interpretação com empatia e forneça pistas pontuais.
4. Destaque que o teste mede competências híbridas do Século XXI (pensamento crítico/criatividade), essenciais para o futuro.
5. Sempre exiba 3 botões/chips sugeridos ao final (ex: "[Me explica de outro jeito?]", "[Quero uma pista]", "[Por que isso importa?]").

Safety/Guardrails: Se a entrada do aluno contiver ofensas, nonsense, zombaria ou fugir totalmente do assunto, ignore o texto e responda estritamente com a resposta amigável default: 
"Vibe errada, parça! 💀 Que tal a gente focar no que realmente importa e amassar esse teste juntos? Escolha uma opção abaixo ou mande sua dúvida!"

Você receberá o histórico da conversa e a última mensagem do aluno.

Formato de saída: RETORNE APENAS UM JSON VÁLIDO no seguinte formato, sem marcações markdown em volta:
{
  "response": "Sua resposta falada em texto (o que o Béco vai dizer).",
  "chips": ["Botão 1", "Botão 2", "Botão 3"]
}
`;

      const contents = [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou no papel do Béco. Aguardando a mensagem do aluno.' }] }
      ];

      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      let response;
      let retries = 5;
      let delay = 4000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: contents,
            config: {
              responseMimeType: "application/json"
            }
          });
          break; // success
        } catch (err: any) {
          if (err?.status === 'UNAVAILABLE' || err?.message?.includes('503')) {
            retries--;
            if (retries === 0) throw err;
            console.log(`High demand in beco-chat, retrying in 2000ms...`);
            await new Promise(res => setTimeout(res, 2000));
          } else {
            console.log('Switching to mock chat.');
            throw err;
          }
        }
      }

      const jsonText = response?.text || "{}";
      let result;
      try {
        result = JSON.parse(jsonText);
      } catch(e) {
        result = { 
          response: "Vixe, deu um bug na matrix aqui 😅 Bora focar na pergunta principal!",
          chips: ["Me explica de outro jeito?", "Quero uma pista", "Por que isso importa?"]
        };
      }
      return res.json(result);
    } catch (error: any) {
      console.log('Serving mock chat.');
      res.json({ 
        response: "Vixe, o sistema tá lotado agora 😅! Mas tamo junto, bora tentar focar na pergunta e responder do seu jeito!",
        chips: ["Tentar de novo", "Entendi", "Beleza"]
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
