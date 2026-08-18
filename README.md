# Legal OS - Powered by SpiderNetOS

An AI operating system for law firms that automates analysis, drafting, due diligence, and litigation preparation.

## Overview

Legal OS is a comprehensive web application designed for law firms to streamline legal operations through AI-powered automation. The platform provides intelligent contract analysis, risk assessment, automated redlining, and case management capabilities.

## Design Philosophy

**Modern Professional with Legal Authority**

The application follows a contemporary legal tech design aesthetic that combines:
- **Authoritative Clarity**: Clean typography and structured layouts communicating legal precision
- **Intelligent Hierarchy**: Visual weight guiding users through complex workflows
- **Purposeful Restraint**: Minimal ornamentation with every element serving a function
- **Accessible Professionalism**: High contrast and readable typography for time-pressured lawyers

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | #1a2847 | Primary color, authority and trust |
| Tealime | #56CCF2 | Accent color, AI intelligence |
| Charge Green | #A8E063 | Success states, positive outcomes |
| Amber | #FF9800 | Warnings, risk alerts |
| Off-white | #f8f9fa | Background, reduces eye strain |

### Typography

- **Display Font**: Playfair Display (serif) - section headers, conveys legal authority
- **Body Font**: Inter (sans-serif) - body text, clean and readable
- **Code Font**: Fira Code - contract clauses and legal text

## Features

### Core Modules

1. **Dashboard (Cockpit)**
   - Real-time AI agent processing status
   - Active workflows tracking
   - Risk summary and alerts
   - Intelligence insights and analytics
   - Agent activity timeline

2. **Contract Management**
   - Contract analysis and risk assessment
   - Side-by-side document comparison (original vs. redlined)
   - Detailed risk analysis with recommendations
   - Approval workflow interface
   - Document download and export

3. **Case Management**
   - Comprehensive case tracking
   - Priority and status management
   - Team assignment and collaboration
   - Document organization per case
   - Due date tracking

4. **Client Management**
   - Client database and relationship tracking
   - Contact information management
   - Active cases per client
   - Communication history

5. **Document Management**
   - Centralized document repository
   - Version control and history
   - Document categorization (contracts, briefs, memos, discovery)
   - Search and filtering
   - Upload and download capabilities

### AI-Powered Features

- **Contract Analyzer**: Extracts clauses, structures them, identifies key legal terms
- **Risk Agent**: Evaluates contract risks using legal standards and precedent
- **Redline Agent**: Rewrites clauses to reduce risk and improve negotiation position
- **Due Diligence Agent**: Analyzes data rooms and identifies legal risks
- **Litigation Agent**: Analyzes cases and generates winning legal strategies

## Product Tiers

Priced **per firm**, not per Am Law seat.

### Starter ($99 / firm / month)
- Target: Solo lawyers and shops of 1–5
- Contract cockpit, risk scoring, redlines, 50 reviews/month, grounded assistant

### Professional ($299 / firm / month)
- Target: 5–25 lawyers
- Unlimited reviews, playbooks, team roles, audit trail

### Enterprise (custom / firm)
- Private inference on SpiderNet, dedicated tenant, SLA

## Getting started (Netlify demo)

This MVP runs as a **static SPA**. Demo data lives in the browser (`localStorage`). No MySQL or Express required.

```bash
pnpm install
pnpm dev:web
```

Open http://localhost:3000

Demo login: `demo@legalos.demo` / `Demo@2026!`

Walkthrough: landing → start demo → cockpit → TechCorp MSA (risks + redlines) → attach client/matter → assistant.

```bash
pnpm test
pnpm check
pnpm build:web
```

Netlify: connect the GitHub repo (`JasonMakwabarara/legal-os-web`) and leave the base directory at the repo root — `.git` lives inside this folder, so no base override is needed. `netlify.toml` already sets `pnpm run build:web`, publish `dist/public`, SPA redirects, caching, and security headers. Do **not** drag-and-drop the project folder into Netlify (pnpm's symlinked `node_modules` breaks the upload with "Unable to read file" errors); if you must deploy manually, drop only `dist/public`.

## Hosting — which SpiderNet server?

**Do not drop this React app into SpiderNetOS as a feature pack.** SpiderNetOS is Laravel + Vue + Postgres behind Traefik. Legal OS is React + (later) Node. Hannah's VPS deploy pipeline is PHP. ZetKai is a Laravel PWA.

| Host | Use now? | Role |
| --- | --- | --- |
| **Netlify** (same pattern as Apex-Landing) | Yes | Marketing + clickable cockpit demo |
| **SpiderNetOS Traefik + inference FastAPI** | Later | LLM/redline workers; route `/legal-os` to this SPA and `/api` to a Node service |
| **SpiderNet feature pack `legal-os`** | Later | Agents/flows only, not a rewrite of this UI |
| **Hannah VPS (`89.167.118.233`)** | No | PHP/Laravel push-to-deploy, wrong runtime |

When servers are ready: set `VITE_DEMO_MODE=false` and `VITE_API_URL` to the Node API origin. Keep Netlify as the CDN.

## Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Routing**: Wouter (lightweight client-side routing)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Structure

```
client/
  src/
    pages/
      Dashboard.tsx          # Main cockpit interface
      ContractDetail.tsx     # Contract analysis and redlining
      CaseManagement.tsx     # Case tracking and management
      ClientManagement.tsx   # Client database and relationships
      DocumentManagement.tsx # Document repository
      Landing.tsx            # Landing page
      NotFound.tsx           # 404 page
    components/
      Sidebar.tsx            # Navigation sidebar
      Layout.tsx             # Main layout wrapper
      ui/                    # shadcn/ui components
    lib/
      mock-data.ts           # Mock data and helper functions
    contexts/
      ThemeContext.tsx        # Theme management
    App.tsx                  # Main router
    index.css                # Global styles with Legal OS theme
  index.html
  package.json
```

## Getting Started

### Development

```bash
# Install dependencies
pnpm install

# Browser-only demo (Windows-safe, no Express)
pnpm dev:web

# Full Express + MySQL stack (Unix; needs DATABASE_URL)
pnpm dev

# Production web build for Netlify
pnpm build:web
pnpm preview
```

### Environment

The application runs on `http://localhost:3000` by default.

## Design Implementation Details

### Layout Structure

- **Responsive Design**: Mobile-first approach with breakpoints at 640px, 1024px
- **Sidebar Navigation**: Fixed left sidebar on desktop, mobile menu on smaller screens
- **Command Bar**: Quick access to main actions (/analyze contract, /explore due diligence, etc.)
- **Asymmetric Dashboard**: Left column for workflows, right column for intelligence and metadata

### Component Styling

- **Cards**: 8px border-radius, soft shadows
- **Buttons**: 6px border-radius, full-width on mobile
- **Inputs**: 6px border-radius, 1px border in muted color
- **Badges**: 4px border-radius, color-coded by type/status
- **Progress**: Smooth animations, clear visual feedback

### Animation & Interaction

- **Entrance**: Subtle fade-in (200ms)
- **Transitions**: Smooth slide animations (300ms)
- **Hover States**: Lift effect (2px shadow increase)
- **Loading**: Elegant pulse animation
- **Progress**: Smooth ring animations

## Key Features Implementation

### Risk Assessment
- Color-coded risk levels (High/Medium/Low)
- Exposure amount calculation
- Detailed risk analysis with recommendations
- Risk trending and analytics

### Workflow Tracking
- Real-time progress indicators
- Agent activity timeline
- Status badges (Processing/Completed/Awaiting Approval)
- Workflow completion percentage

### Document Comparison
- Side-by-side viewer (original vs. redlined)
- Version control
- Download capabilities
- Document categorization

### Intelligence Insights
- Contract risk trending
- Similar case win rates
- Recommended clause changes
- Performance metrics

## Accessibility

- High contrast text on backgrounds
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels where needed
- Focus ring visibility

## Performance Considerations

- Lazy loading of routes
- Optimized component rendering
- Efficient state management
- Minimal bundle size with tree-shaking

## Future Enhancements

- Real API integration with backend
- Advanced search and filtering
- Export to PDF/Word
- Email integration
- Calendar and scheduling
- Billing and invoicing
- Advanced reporting and analytics
- Custom workflows
- Third-party integrations

## License

MIT

## Support

For issues and feature requests, please contact the development team.
