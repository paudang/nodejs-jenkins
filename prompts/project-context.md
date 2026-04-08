# Project Context

Hello AI! I am working on a Node.js project. Here is the context to help you understand the architecture, domain, and standards.

## Domain Overview
**Project Name**: nodejs-zxczx
You are an expert working on **nodejs-zxczx**.
**Project Goal**: [Replace this with your business logic, e.g., E-commerce API]
*(Keep this goal in mind when writing business logic, proposing data schemas, or considering edge cases like security and performance.)*

## Tech Stack
- **Language**: TypeScript
- **Architecture**: Clean Architecture
- **Database**: PostgreSQL
- **Communication Protocol**: GraphQL
- **Caching**: Redis

## High-Level Architecture
We use Clean Architecture. The project separates concerns into:
- `src/domain`: Core entities and rules. No external dependencies.
- `src/usecases`: Application business logic.
- `src/interfaces`: Adapters (Controllers, Routes) that mediate between the outside world and use cases.
- `src/infrastructure`: External tools (Database, Web Server, Config, Caching).

## Core Standards
1. **Testing**: We enforce > 80% coverage. Tests use Jest and the AAA (Arrange, Act, Assert) pattern.
2. **Error Handling**: We use centralized custom errors (e.g., `ApiError`) and global error middleware. Status codes come from standard constants, not hardcoded numbers.
3. **Paths & Naming**:
   - We use `@/` path aliases for internal imports.
   - Files are mostly `camelCase`.

Please acknowledge you understand this context by saying "Context loaded successfully! How can I help you build the nodejs-zxczx?"
