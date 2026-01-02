# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

```
mobile/
├── app/                           # Expo Router root (file-based routing)
│   ├── _layout.tsx                # Root layout + global providers (theme, context, navigation)
│   ├── (auth)/                    # Auth flow (login, signup)
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/                     # Main app with tabs
│   │   ├── _layout.tsx
│   │   ├── home.tsx                # Dashboard / assigned tasks
│   │   ├── tasks/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx           # Task list
│   │   │   └── [id].tsx            # Task detail screen
│   │   └── profile.tsx             # Profile/settings tab
│   └── modal.tsx                   # Global modal component
│
├── assets/                         # Static assets
│   ├── fonts/
│   └── images/
│
├── components/                     # Reusable React components
│   ├── ui/                         # Buttons, cards, modals
│   └── feature-specific/           # TaskCard, FormField, etc.
│
├── constants/                       # App-wide constants
│   └── theme.ts
│
├── core/                            # Infrastructure / services layer
│   ├── api/                        # Axios client, API endpoints
│   ├── auth/                       # Auth service, secure storage
│   ├── db/                         # Local SQLite / WatermelonDB + repositories
│   └── sync/                       # Offline-first sync engine
│
├── features/                        # Feature domain logic (optional if you want to separate further)
│   ├── tasks/
│   │   ├── task.service.ts
│   │   └── task.types.ts
│   └── forms/
│       └── form.service.ts
│
├── hooks/                            # Custom hooks
│   ├── useNetwork.ts
│   └── useTaskSync.ts
│
├── utils/                            # Utility functions
│   └── date.ts
│
├── tests/                            # Unit & integration tests
│   ├── core/
│   └── features/
│
├── app.json
├── tsconfig.json
├── package.json
└── README.md

```
