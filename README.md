# InvoiceFlow - Small Business Invoice Management Platform

A comprehensive invoice management system built with React, TypeScript, Node.js, and PostgreSQL. Designed with TDD, accessibility (WCAG 2.1 AA), and modern best practices.

## Features

### Core Features (MVP)
- **Invoice Builder**: Multi-step wizard for creating invoices with line items, tax, discounts
- **Dashboard & Analytics**: Revenue charts, payment status breakdown, activity feed
- **Client Management**: Full CRUD operations with invoice history
- **Invoice List**: Sortable, filterable table with bulk actions

### Key Differentiators
- ✅ **Test-Driven Development**: Comprehensive test coverage with Jest + React Testing Library
- ✅ **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- ✅ **PDF Generation**: Professional invoice PDFs for download and email
- ✅ **Responsive Design**: Mobile-first approach for invoice creation

## Tech Stack

### Frontend
- React 18 + TypeScript
- Material-UI v5
- React Hook Form
- Recharts (visualizations)
- React Router v6
- TanStack Query (React Query)
- Jest + React Testing Library

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- JWT Authentication
- RESTful API

### DevOps
- GitHub Actions CI/CD
- ESLint + Prettier
- Husky pre-commit hooks

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd invoiceflow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend
cp frontend/.env.example frontend/.env
```

4. Set up database
```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. Start development servers
```bash
# From root directory
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:3000

## Testing

Run all tests:
```bash
npm test
```

Run backend tests:
```bash
npm run test:backend
```

Run frontend tests:
```bash
npm run test:frontend
```

## Project Structure

```
invoiceflow/
├── backend/          # Node.js + Express API
├── frontend/         # React SPA
├── package.json      # Root workspace config
└── README.md
```

## License

MIT

