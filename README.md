# Elo Escola - Sistema de Gestão Escolar

## Visão Geral

O Elo Escola é uma plataforma completa de gestão escolar, projetada para atender às necessidades de administradores e professores. A plataforma facilita a gestão de alunos, turmas, diários de classe, atividades pedagógicas, calendário escolar e cronograma anual.

## Estrutura do Projeto

O projeto é desenvolvido com Next.js, utilizando React com TypeScript e Tailwind CSS para o front-end.

```
├── app/
│   ├── admin/            # Painel administrativo
│   ├── professor/        # Painel do professor
│   ├── login/            # Página de login
│   └── utils/            # Utilitários (autenticação, etc.)
├── public/               # Arquivos estáticos
└── ...
```

## Funcionalidades

### Painel Administrativo

- **Visão Geral**: Dashboard com estatísticas e atividades recentes
- **Usuários**: Gerenciamento de usuários do sistema
- **Alunos**: Cadastro e gerenciamento de alunos
- **Turmas**: Criação e configuração de turmas
- **Diários**: Acompanhamento dos diários de classe
- **Atividades Pedagógicas**: Gerenciamento de atividades
- **Calendário**: Visualização e gestão do calendário escolar
- **Cronograma Anual**: Configuração do cronograma anual

### Painel do Professor

- **Diários**: Registro da rotina diária dos alunos
- **Planos de Aula**: Registro das atividades pedagógicas realizadas em sala
- **Pareceres**: Registro de pareceres descritivos ao final do período letivo
- **Calendário**: Acesso ao cronograma anual
- **Atividades**: Registro de atividades extras relacionadas às turmas



## Autenticação e Autorização

O sistema utiliza um mecanismo de autenticação baseado em roles:

- `ADMIN`: Acesso total ao sistema
- `PROFESSOR`: Acesso ao painel do professor e funcionalidades específicas

## Instalação e Configuração

### Requisitos

- Node.js (versão 18.x ou superior)
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd elo-web
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
# Outras variáveis necessárias
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Desenvolvimento

### Estrutura de Código

- Os componentes são organizados por funcionalidade
- Estilização feita com Tailwind CSS
- Autenticação e autorização gerenciadas em `/app/utils/auth.ts`

### Convenções de Código

- Utilize TypeScript para tipagem estática
- Siga as convenções de nomenclatura:
  - Componentes: PascalCase
  - Funções e variáveis: camelCase
  - Arquivos de componentes: PascalCase.tsx
  - Outros arquivos: camelCase.ts

## Implantação

O projeto pode ser implantado em qualquer plataforma que suporte Next.js:

1. Construa o projeto:
```bash
npm run build
# ou
yarn build
```

2. Inicie o servidor em produção:
```bash
npm start
# ou
yarn start
```

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Recursos Técnicos

- **Framework**: Next.js com App Router
- **Estilização**: Tailwind CSS
- **Linguagem**: TypeScript
- **Autenticação**: Sistema de roles (ADMIN, PROFESSOR)
