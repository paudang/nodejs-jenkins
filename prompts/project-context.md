# Project Context

Hello AI! I am working on a Node.js project. Here is the context to help you understand the architecture, domain, and standards.

## Domain Overview
**Project Name**: nodejs-service
You are an expert working on **nodejs-service**.
**Project Goal**: [Replace this with your business logic, e.g., E-commerce API]
*(Keep this goal in mind when writing business logic, proposing data schemas, or considering edge cases like security and performance.)*

## Tech Stack
- **Language**: TypeScript
- **Architecture**: MVC
- **Database**: MySQL
- **Communication Protocol**: REST APIs
- **Caching**: Redis

## High-Level Architecture
We use the MVC (Model-View-Controller) pattern.
- `src/models`: Database schemas/models.
- `src/controllers`: Handling incoming requests and implementing business logic.
- `src/routes`: API endpoints mapped to controllers.

## Core Standards
1. **Testing**: We enforce > 80% coverage. Tests use Jest and the AAA (Arrange, Act, Assert) pattern.
2. **Error Handling**: We use centralized custom errors (e.g., `ApiError`) and global error middleware. Status codes come from standard constants, not hardcoded numbers.
3. **Paths & Naming**:
   - We use `@/` path aliases for internal imports.
   - Files are mostly `camelCase`.

Please acknowledge you understand this context by saying "Context loaded successfully! How can I help you build the nodejs-service?"
