# CoolBoard

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Code Coverage](https://img.shields.io/badge/coverage-90%25-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Version](https://img.shields.io/badge/version-1.0.0-lightgrey)

## 📋 Table of Contents

- [📖 About The Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🛠️ Built With](#️-built-with)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [💻 Usage](#-usage)
- [📜 Project Scripts](#-project-scripts)
- [🐳 Docker Development](#-docker-development)
- [🗄️ Database Management](#️-database-management)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 📖 About The Project

CoolBoard is a modern, production-ready Kanban board application built with Next.js 15 and React 19. It features a robust task management system with dual ORM support (Drizzle + Prisma), comprehensive database tooling, and a beautiful, responsive interface powered by Shadcn UI.

## ✨ Key Features

- **Modern Stack**: Built with Next.js 15, React 19, and TypeScript for type-safe development
- **Dual ORM Support**: Both Drizzle ORM and Prisma for flexible database operations
- **Real-time Updates**: Optimistic updates with React Query for enhanced UX
- **Task Management**: Full CRUD operations with priority levels, status tracking, and assignee management
- **Soft Delete Logic**: Data integrity with soft deletion using `deletedAt` timestamps
- **Docker Support**: Containerized PostgreSQL for consistent development environments
- **Production Ready**: Comprehensive database migration and deployment scripts
- **Responsive Design**: Fully accessible UI components built with Shadcn UI and Tailwind CSS

## 🛠️ Built With

### Frontend
- **Framework**: Next.js 15 (with React 19)
- **UI Library**: Shadcn UI + Radix UI primitives
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation

### Backend & Database
- **Database**: PostgreSQL 17.5
- **ORM**: Drizzle ORM + Prisma (dual setup)
- **Database Client**: `postgres` driver
- **Migrations**: Both Drizzle Kit and Prisma migrations support

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or higher)
  ```sh
  node --version
  ```
- **npm** (latest version)
  ```sh
  npm install npm@latest -g
  ```
- **Docker & Docker Compose** (for local database)
  ```sh
  docker --version
  docker-compose --version
  ```

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/coolboard.git
   ```

2. Navigate to the project directory:
   ```sh
   cd coolboard
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

### Database Setup

#### Option 1: Local Development with Docker (Recommended)

1. Start the PostgreSQL database:
   ```sh
   docker-compose up -d
   ```

2. Create a `.env.local` file for local development:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/kanban"
   NODE_ENV="development"
   ```

3. Set up the database with Prisma:
   ```sh
   npm run prisma:setup
   ```

#### Option 2: Production/Remote Database

1. Create a `.env.local` file from `.example.env.production`:
   ```env
   DATABASE_URL="your_production_database_url"
   POSTGRES_URL="your_postgres_url"
   PRISMA_DATABASE_URL="your_prisma_accelerate_url"
   NODE_ENV="production"
   DEPLOYMENT_ENV="remote"
   ```

2. Deploy migrations:
   ```sh
   npm run prisma:migrate
   ```

## 💻 Usage

### Development Server

Start the development server with Turbopack:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Production Build

Build and start the production version:

```sh
npm run build
npm run start
```

## 📜 Project Scripts

### Core Application
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the project for production
- `npm run start` - Run the production build
- `npm run lint` - Run ESLint code analysis

### Drizzle ORM Scripts
- `npm run db:generate` - Generate migration files from Drizzle schema
- `npm run db:migrate` - Apply Drizzle migrations to database
- `npm run db:studio` - Open Drizzle Studio database GUI
- `npm run db:push` - Push schema changes directly (rapid prototyping)

### Prisma Scripts
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Deploy Prisma migrations to production
- `npm run prisma:migrate:dev` - Create and apply Prisma migrations in development
- `npm run prisma:push` - Push Prisma schema changes directly
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:studio` - Open Prisma Studio database GUI
- `npm run prisma:setup` - Complete Prisma setup (push + seed)

### Database Utilities
- `npm run setup-db` - Initialize database connection
- `npm run test-db` - Test database connectivity
- `npm run prisma:test` - Test Prisma connection
- `npm run db:export` - Export database to SQL backup
- `npm run db:export:json` - Export database to JSON format

## 🐳 Docker Development

### Starting the Database

```sh
# Start PostgreSQL container
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs postgres

# Stop the database
docker-compose down
```

### Database Connection Details

- **Host**: `localhost`
- **Port**: `5433` (mapped from container's 5432)
- **Database**: `kanban`
- **Username**: `postgres`
- **Password**: `postgres`

## 🗄️ Database Management

### Schema Management

The project supports both Drizzle and Prisma for different use cases:

- **Drizzle**: Primary ORM for application logic
- **Prisma**: Used for migrations, seeding, and database management

### Migration Workflow

1. **Development**: Use Drizzle for schema changes
   ```sh
   npm run db:generate
   npm run db:migrate
   ```

2. **Production**: Use Prisma for deployment
   ```sh
   npm run prisma:migrate
   ```

### Database Seeding

```sh
# Seed with sample data
npm run prisma:seed

# Reset and reseed
npm run prisma:push && npm run prisma:seed
```

### Backup & Export

```sh
# Export to SQL (requires Docker container running)
npm run db:export

# Export to JSON format
npm run db:export:json
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Development Workflow

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and test thoroughly
4. Run tests and linting (`npm run lint`)
5. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the Branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.