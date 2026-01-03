# Backend file structure:

```
backend/
├── .dockerignore
├── .gitignore
├── .github/
│   └── workflows/
│       ├── cd.yml
│       └── ci.yml
├── docker-compose.dev.yml
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.dev
├── nodemon.json
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   ├── forms/
│   │   ├── sync/
│   │   │   ├── sync.controller.ts
│   │   │   ├── sync.routes.ts
│   │   │   └── sync.service.ts
│   │   └── tasks/
│   │       ├── task.controller.ts
│   │       ├── task.repository.ts
│   │       ├── task.routes.ts
│   │       └── task.service.ts
│   ├── shared/
│   │   ├── errors/
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── system-documentation/
│   ├── api-design.md
│   └── database-design.md
└── tsconfig.json
```
