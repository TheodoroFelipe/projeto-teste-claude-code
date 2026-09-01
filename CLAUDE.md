# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descrição do projeto

App de acompanhamento de atletas (treino, evolução física, ranking por XP, planos de treino) com autenticação e papéis de atleta/treinador. Migrado de um scaffold Vite para Next.js (App Router) para permitir backend real (rotas/Server Actions, banco de dados).

## Tecnologias usadas

- **Next.js 16** (App Router) — framework, roteamento e build
- **React 18** — biblioteca de UI
- **TypeScript** (modo `strict`) — tipagem estática
- **ESLint 9** (`eslint-config-next`) — lint
- Node.js 20+ (gerenciado via `nvm`)

## Comandos

```bash
npm install        # instala dependências
npm run dev         # servidor de desenvolvimento (http://localhost:3000)
npm run build        # build de produção (next build)
npm run start         # serve o build de produção localmente
npm run lint          # roda o ESLint
```

## Estrutura de pastas

```
├── public/            # arquivos estáticos servidos diretamente
├── src/
│   ├── app/             # rotas do App Router (page.tsx por rota, layout.tsx raiz)
│   ├── screens/          # componentes de tela ('use client'), um por página,
│   │                     #   renderizados pelas rotas em src/app/**/page.tsx
│   ├── components/        # componentes reutilizáveis
│   ├── context/           # Context Providers
│   ├── hooks/             # hooks compartilhados
│   ├── utils/             # lógica compartilhada
│   ├── types/             # tipos compartilhados
│   ├── data/              # dados semente/mock
│   ├── index.css           # estilos globais (tokens de design)
│   └── App.css             # layout/shell + classes de UI compartilhadas
├── next.config.mjs      # config do Next.js
├── eslint.config.mjs    # config do ESLint (flat config, eslint-config-next)
└── tsconfig.json        # config do TypeScript
```

Todo CSS é importado globalmente a partir de `src/app/layout.tsx` (o App Router só
permite CSS global no layout raiz) — ao criar um novo componente/tela com CSS
próprio, adicione o `import` do arquivo `.css` lá, não no próprio componente.

Componentes/telas que usam hooks (`useState`, `useEffect` etc.) precisam da
diretiva `'use client'` no topo do arquivo.

## Padrões de código

- Nomes de arquivo em `camelCase` (ex.: `formatDate.ts`, `useAuth.ts`), exceto componentes, que usam `PascalCase` (ex.: `MeuComponente.tsx`).
- Componentes funcionais com hooks — sem class components.
- Um componente por arquivo, com o CSS correspondente em `MeuComponente.css` quando necessário (importado em `src/app/layout.tsx`, ver acima).
- TypeScript em modo `strict` (já configurado em `tsconfig.json`); evitar `any`.
- Tipar props explicitamente com `interface` (ex.: `interface MeuComponenteProps { ... }`).
- Exports nomeados para hooks e utilitários; `export default` reservado para o componente principal de cada arquivo.
- Sem uso de `React.FC` — tipar props diretamente no parâmetro da função.
- Rodar `npm run lint` antes de considerar uma alteração finalizada.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
