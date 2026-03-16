# CLAUDE.md - Project Instructions

> **For the Coordinator**: Read `.team/coordinator-instructions.md` for your operating instructions.

## Quick Reference

- **Project**: 美邻网 (Meilin Community Network)
- **Stack**: Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase
- **Team**: Ensemble mob programming (6 members)
- **Deployment**: Vercel

## File Structure

```
meilin-nextjs/
├── .team/                    # Team member profiles
│   ├── coordinator-instructions.md
│   ├── marty-cagan.md
│   ├── richard-bartle.md
│   ├── kent-beck.md
│   ├── don-norman.md
│   ├── lee-robinson.md
│   └── james-bach.md
├── docs/                     # Project documentation
│   ├── glossary.md
│   ├── deferred-items.md
│   └── future-ideas.md
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # React components
│   └── lib/                  # Utilities, hooks, types
├── PROJECT.md                # Project owner constraints
├── AGENTS.md                 # Team structure & conventions
└── vercel.json               # Vercel configuration
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
```

## Key Conventions

- **TDD**: Write failing test first, then implementation
- **TypeScript**: Strict mode, no `any` types
- **Components**: Server Components by default, Client only when needed
- **Styling**: Tailwind CSS + shadcn/ui components
- **Git**: Atomic commits, descriptive messages

## Team Workflow

1. Coordinator activates team members based on task
2. Driver implements with Reviewers providing feedback
3. Consensus required before merge
4. Mini-retro after each CI build
5. Full retro after each shipped PR

---

**Coordinators**: Read `.team/coordinator-instructions.md` before starting work.
**Team Members**: Read your profile in `.team/` and `PROJECT.md` for constraints.
