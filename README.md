# CoolBoard

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Code Coverage](https://img.shields.io/badge/coverage-90%25-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Version](https://img.shields.io/badge/version-1.0.0-lightgrey)

## 📋 Table of Contents

- [📖 About The Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🛠️ Built With](#️-built-with)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [💻 Usage](#-usage)
- [📜 Project Scripts](#-project-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 📖 About The Project

This is a modern, full-stack web application built with Next.js 15 and React 19, designed for teams to manage their tasks. The project is based on the latest Next.js features such as Server Components, Server Actions, and React Query.

## ✨ Key Features

- Secure user registration and login managed by NextAuth.js.
- Full CRUD (Create, Read, Update, Delete) functionality for tasks using Server Actions and React Query.
- Optimistic Updates to enhance user experience.
- Server-side filtering of tasks based on their status.
- Soft delete logic (with a `deletedAt` column) to maintain data integrity.
- Fully responsive and accessible UI components built with Shadcn UI.

## 🛠️ Built With

- **Framework**: Next.js 15 (with React 19)
- **UI**: Tailwind CSS & Shadcn UI
- **State & Data Fetching**: React Query (integrated with Server Actions)
- **Database & ORM**: PostgreSQL and Drizzle ORM

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/ehkarabas/kanban-board.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd kanban-board
    ```
3.  Install dependencies:
    ```sh
    npm install
    ```
4.  Set up environment variables. Create a `.env.local` file from `.env.example` and fill in the required values:
    ```
    DATABASE_URL="your_database_url"
    ```

## 💻 Usage

To start the development server, run the following command:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📜 Project Scripts

- `npm install`: Installs project dependencies.
- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Builds the project for production.
- `npm run start`: Runs the production build.
- `npm run lint`: Runs the code linter.
- `npm run db:generate`: Generates migration files based on the Drizzle ORM schema.
- `npm run db:migrate`: Applies the generated migrations to the database.
- `npm run db:studio`: Opens the Drizzle Studio UI to manage the database.
- `npm run db:push`: Pushes schema changes directly to the database (for rapid prototyping).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. 

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.