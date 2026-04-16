# Service Report 📊

**Service Report** (Relatório de Serviço de Campo) é uma aplicação web moderna projetada para facilitar o registro e o acompanhamento de horas mensais, visitas e contatos. 

Um sistema de produtividade pessoal construído para ajudar a organizar suas atividades e manter seu histórico seguro, e sempre a mão.

## 🚀 Funcionalidades

- **Visão Mensal (Mês):** Acompanhe seu progresso de horas, publicações distribuídas, revisitas e estudos no mês atual de forma rápida e intuitiva.
- **Histórico:** Mantenha um registro completo de todos os meses anteriores para análises retrospectivas.
- **Pessoas (Contatos):** Gerencie os seus contatos, incluindo informações importantes e detalhes de acompanhamento.
- **Revisitas (Follow-ups):** Acompanhe os retornos e pessoas interessadas com eficiência.
- **Configurações:** Adapte a experiência e defina suas metas.

## 💻 Tecnologias e Ferramentas

O projeto foi construído utilizando um ecossistema moderno focado em performance, simplicidade e experiência de usuário:

- **[Next.js](https://nextjs.org/)** (App Router)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** para estilização rápida e responsiva
- **[sql.js](https://github.com/sql-js/sql.js)** para gerenciamento de banco de dados SQLite diretamente no navegador/ambiente local
- **[TypeScript](https://www.typescriptlang.org/)** para maior segurança no código

## 🛠️ Como Executar o Projeto

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 18+) instalado na sua máquina.

### Passos de Instalação

1. Clone ou baixe o repositório.
2. Instale as dependências executando na raiz do projeto:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em funcionamento.

## 📂 Estrutura do Projeto

A arquitetura do projeto segue o padrão App Router do Next.js e está dividida em módulos lógicos (`_features`, `_components`, `_lib`):

- `/app`: Páginas da aplicação e layouts principais (`/contacts`, `/history`, `/settings`, etc.).
- `/app/_components`: Componentes visuais reutilizáveis em toda a aplicação (como a `AppShell`).
- `/app/_features`: Regras de negócio e componentes específicos de cada domínio da aplicação (como o `planner`).
- `/app/_lib`: Código de infraestrutura, incluindo conexão com banco de dados (`sqliteClient`).

---
*Feito para registrar horas mensais de forma simples e eficiente.*
