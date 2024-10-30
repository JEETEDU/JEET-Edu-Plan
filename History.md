```bash
npx create-next-app@latest .
npm install drizzle-orm mysql2
npm install -D drizzle-kit
```
---
add to package.json,
```json
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "db:generate": "drizzle-kit generate",
        "db:migrate": "drizzle-kit migrate",
        "db:push": "drizzle-kit push"
    }
```