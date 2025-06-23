# 🚀 CLI Scraper

## 🎯 Objetivos do Projeto

Este projeto foi desenvolvido como parte do **roadmap de aperfeiçoamento técnico - Fase 1**, focando em:

- ✅ **Advanced JavaScript (ES2025) & TypeScript** - Generics, tipos condicionais, decorators
- ✅ **Node.js Internals** - Event loop, streams, worker threads, clustering
- ✅ **Asynchronous Patterns** - Promises, async iterators, concorrência controlada

---

## 🛠️ Tecnologias & Conceitos Aplicados

### **TypeScript Avançado**

- **Generics com Constraints**: `ScrapingTarget<T>`, `ApiResponse<T>`
- **Tipos Condicionais**: `T extends string ? A : B`
- **Mapped Types**: `{ readonly [K in keyof T]: T[K] }`
- **Utility Types**: `PartialExcept<T, K>`, `DeepReadonly<T>`
- **Decorators**: `@measure`, `@retry` para metaprogramação

### **Node.js Internals**

- **Worker Threads**: Processamento paralelo real sem bloqueio
- **Streams API**: Transform e Writable streams customizados
- **Event Loop**: Aproveitamento máximo da concorrência
- **Back-pressure**: Controle automático de fluxo de dados

### **Padrões Assíncronos**

- **Async Iterators**: `async function*` e `for await`
- **Promise Queuing**: Controle de concorrência com `p-queue`
- **Pipeline Streams**: Processamento eficiente de dados
- **MessageChannel**: Comunicação entre threads

---

## 📦 Instalação

```bash
npm install
npm run build

```

## 🚀 Uso

### **Comandos Básicos**

```bash
# Scraping simples
node dist/index.js scrape https://httpbin.org/json

# Múltiplas URLs com saída para arquivo
node dist/index.js scrape \
  https://httpbin.org/json \
  https://jsonplaceholder.typicode.com/posts/1 \
  --output results.json

node dist/index.js scrape \
  https://api.github.com/users/octocat \
  https://api.github.com/users/defunkt \
  --concurrency 10 \
  --output github-users.json \
  --transform "data => ({ name: data.name, followers: data.followers })"
```

### **Opções Disponíveis**

| Opção                        | Descrição               | Padrão |
| ---------------------------- | ----------------------- | ------ |
| `-c, --concurrency <number>` | Requests simultâneos    | `5`    |
| `-s, --selector <string>`    | Seletor CSS para HTML   | -      |
| `-o, --output <file>`        | Arquivo de saída        | -      |
| `-t, --transform <function>` | Função de transformação | -      |

---

## 🏗️ Arquitetura

```
src/
├── types/           # 🎯 Tipos TypeScript avançados
│   └── index.ts     # Generics, condicionais, utility types
├── decorators/      # ✨ Decorators para metaprogramação
│   └── index.ts     # @measure, @retry
├── streams/         # 🌊 Sistema de streams customizado
│   └── index.ts     # Transform/Writable streams
├── workers/         # ⚡ Worker threads para paralelismo
│   └── scraper-worker.ts
├── scraper/         # 🔄 Async iterators e controle de concorrência
│   └── async-iterator.ts
├── cli/             # 🖥️ Interface de linha de comando
│   └── index.ts     # Commander.js + progress bars
└── index.ts         # 🚪 Entry point
```

---

## 💡 Exemplos Práticos

### **1. Monitoramento de APIs**

```bash
# Verificar status de múltiplos serviços
node dist/index.js scrape \
  https://httpbin.org/status/200 \
  https://httpbin.org/status/404 \
  https://httpbin.org/delay/2 \
  --concurrency 3 \
  --output health-check.json
```

### **2. Coleta de Dados JSON**

```bash
# Extrair dados específicos de APIs
node dist/index.js scrape \
  https://jsonplaceholder.typicode.com/posts/1 \
  https://jsonplaceholder.typicode.com/posts/2 \
  --transform "data => ({ id: data.id, title: data.title })" \
  --output posts.json
```

---

## 📈 Performance

### **Benchmarks Típicos**

- ⚡ **Concorrência**: Até 20 requests simultâneos
- 🔄 **Throughput**: ~100-500 URLs/minuto (dependendo da API)
- 💾 **Memória**: Uso otimizado com streams (processo constante)
- 🛡️ **Confiabilidade**: Retry automático + timeout por worker

---

## 🤝 Contribuindo

Este é um projeto de aprendizado, mas contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 👨‍💻 Autor

- LinkedIn: [Gabrielli M. Feletti](https://www.linkedin.com/in/gabrielli-mombrini-feletti/)
