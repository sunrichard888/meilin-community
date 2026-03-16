# 美邻网 (Meilin Community Network)

A neighborhood community platform connecting local residents to share updates, recommendations, and build stronger communities.

> **This document contains project owner constraints.** The team must follow these rules. Changes to this document require project owner approval.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Package Manager**: npm

## Development Mandates

These are non-negotiable practices for the project:

- **Test-Driven Development**: Every feature is built using strict TDD. No production code without a failing test.
- **Mob/Ensemble Programming**: All production code is written by the mob. No solo commits to production code.
- **Consensus Decision-Making**: The team operates by consensus. No single technical lead or decision-maker.
- **Driver-Reviewer Mob Model**: At most one agent (the Driver) may modify files at any time. The remaining agents participate as Reviewers via read-only access and messaging.
- **Code Quality Gates**: TypeScript strict mode, ESLint passing, all tests green before merge.

## Environment & Tooling

- **Local Development**: `npm run dev` on port 3000
- **Build**: `npm run build`
- **Environment Variables**: `.env.local` for Supabase credentials
- **Git Workflow**: Feature branches → PR → review → merge to master

## Scope

### Must Have
- User authentication (signup, login, logout)
- User profiles (nickname, avatar)
- Create, read, update, delete posts
- Like and comment on posts
- Feed showing recent posts
- Mobile-responsive design
- Basic moderation (report content)

### Should Have
- User search and follow
- Notifications for interactions
- Image uploads for posts
- Content categories/tags
- User blocking

### Could Have
- Private messaging between users
- Events calendar
- Buy/sell marketplace
- Neighborhood groups/sub-communities
- Admin dashboard

### Out of Scope
- Native mobile apps (web-first approach)
- Real-time chat (async posts/comments only)
- Video uploads (images only)
- Payment/monetization features
- Third-party integrations

## Vercel Configuration

- **Branch**: master
- **Install Command**: `npm install --legacy-peer-deps`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Region**: sin1 (Singapore)
