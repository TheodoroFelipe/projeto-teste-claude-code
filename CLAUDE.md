# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descrição do projeto

Projeto de testes para experimentar o Claude Code em um app React + TypeScript. Scaffold criado com Vite, ainda em estágio inicial (componente único de exemplo com contador).

## Tecnologias usadas

- **React 18** — biblioteca de UI
- **TypeScript** (modo `strict`) — tipagem estática
- **Vite 5** — build tool e dev server
- **ESLint 9** — lint
- Node.js 20 (gerenciado via `nvm`, definido como versão padrão)

## Comandos

```bash
npm install        # instala dependências
npm run dev         # servidor de desenvolvimento (http://localhost:5173)
npm run build        # build de produção (tsc -b && vite build) em dist/
npm run preview      # serve o build de produção localmente
npm run lint          # roda o ESLint
```

## Estrutura de pastas

```
├── public/          # arquivos estáticos servidos diretamente (não passam pelo build)
├── src/
│   ├── main.tsx       # ponto de entrada, monta o React na div#root
│   ├── App.tsx        # componente raiz
│   ├── App.css        # estilos do App
│   ├── index.css       # estilos globais
│   └── vite-env.d.ts    # tipos do ambiente Vite
├── index.html        # HTML principal, referenciado pelo Vite
├── tsconfig.json     # config do TypeScript
└── vite.config.ts     # config do Vite
```

À medida que o projeto crescer, novos componentes devem ficar em `src/components/`, páginas/rotas em `src/pages/` (ou `src/routes/`), e lógica compartilhada (hooks, utils, tipos) em `src/hooks/`, `src/utils/` e `src/types/`, respectivamente — criando essas pastas apenas quando houver conteúdo real para colocar nelas. Context Providers ficam em `src/context/`, e dados semente/mock em `src/data/`.

## Padrões de código

- Nomes de arquivo em `camelCase` (ex.: `formatDate.ts`, `useAuth.ts`), exceto componentes, que usam `PascalCase` (ex.: `MeuComponente.tsx`).
- Componentes funcionais com hooks — sem class components.
- Um componente por arquivo, com o CSS correspondente em `MeuComponente.css` quando necessário.
- TypeScript em modo `strict` (já configurado em `tsconfig.json`); evitar `any`.
- Tipar props explicitamente com `interface` (ex.: `interface MeuComponenteProps { ... }`).
- Exports nomeados para hooks e utilitários; `export default` reservado para o componente principal de cada arquivo.
- Sem uso de `React.FC` — tipar props diretamente no parâmetro da função.
- Rodar `npm run lint` antes de considerar uma alteração finalizada.
