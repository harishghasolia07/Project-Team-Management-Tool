# VZNX Mini — Projects, Tasks & Team

A lightweight project management application built with React, TypeScript, and Tailwind CSS. Track projects, manage tasks, and monitor team capacity with a clean, intuitive interface.

## Features

- **Landing Page** with hero, value props, and CTAs leading into the workspace
- **Project Dashboard** to create, edit, delete, tag, and filter projects with auto progress tracking
- **Task Management** featuring due dates, assignments, drag-and-drop reorder, bulk complete/delete, and capacity-aware progress
- **Progress Forecasting** via a burn-up insight card (planned vs completed)
- **Team Overview** with live capacity bars, assigned/complete stats, and modal drill‑down per member
- **Data Persistence** in browser localStorage with backward-compatible migrations for new fields
- **Responsive & Accessible UI** including keyboard navigation and focus styling

## Data Models

### Project
- `id`: Unique identifier
- `name`: Project name
- `status`: 'In Progress' | 'Completed' | 'On Hold'
- `progress`: 0-100% (auto-calculated from tasks)
- `tasks`: Array of tasks
- `tags`: Optional labels surfaced on project cards and filters

### Task
- `id`: Unique identifier
- `name`: Task name
- `assignedTo`: Optional team member name
- `completed`: Boolean flag
- `dueDate`: ISO string (auto-generated for legacy records)

### Team Member
- Derived from task assignments
- Tracks assigned and completed counts, remaining load, and capacity percentage
- Capacity calculated from active (incomplete) tasks: `(remaining / 5) * 100`

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Add a Project
1. Click "Add Project" button on Dashboard
2. Enter project name
3. Optionally set status and initial progress (only when no tasks)
4. Click "Create"

### Manage Tasks
1. Click "Open Project" on a card to view details
2. Click "Add Task" to create a new task with optional owner and due date
3. Drag tasks to reorder (manual mode) or switch sorting to due date/status
4. Toggle the checkbox or use bulk actions to complete tasks
5. Progress automatically updates based on task completion

### View Team Capacity
1. Navigate to "Team" page
2. Review assigned vs completed counts with capacity bars
3. Colour coding:
   - Green: < 60% active load
   - Orange: 60-84% active load
   - Red: ≥ 85% active load
4. Click a team member to open a modal grouping their tasks by project with status and due date info

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   └── CapacityBar.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── ProjectDetail.tsx
│   ├── Team.tsx
│   └── Landing.tsx
├── hooks/              # Custom React hooks
│   └── useProjects.ts
├── utils/              # Utility functions
│   └── router.tsx
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## State Management

The `useProjects` hook provides centralized state management:

```typescript
const {
  projects,
  addProject,
  editProject,
  deleteProject,
  addTask,
  toggleTask,
  deleteTask,
  setTasksCompletion,
  deleteTasksBulk,
  reorderTasks,
  resetDemoData,
  isLoaded
} = useProjects();
```

## Routing

Hash-based routing implemented in `utils/router.tsx`:

- `/` - Marketing landing page
- `/dashboard` - Project dashboard
- `/project/:id` - Project details
- `/team` - Team overview

## Styling

Uses **Tailwind CSS** for all styling:
- Clean, minimal design with neutral colors
- Responsive grid layouts (1 column mobile, 2-3 columns desktop)
- Smooth transitions and hover states
- Accessibility-focused with visible focus indicators

## Persistence

Data is stored in browser localStorage with key `vznx_projects_v1`. To swap persistence layer:

1. Modify `useProjects` hook in `src/hooks/useProjects.ts`
2. Replace `localStorage` calls with your backend API
3. Example: Replace `localStorage.getItem()` with `fetch('/api/projects')`

For production apps, consider:
- **Supabase**: Real-time database with auth
- **Firebase**: Serverless backend with real-time updates
- **REST API**: Traditional backend with Node.js/Express

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Traditional Hosting

1. Build the project: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure server to serve `index.html` for all routes (for SPA routing)

## Performance

- **Bundle size**: ~166KB (51KB gzipped)
- **Load time**: < 1 second on modern networks
- **Lighthouse score**: 95+ performance

## Accessibility

- Keyboard navigation fully supported
- All buttons and links have descriptive labels
- Form inputs have associated labels
- Color not sole indicator of status (text + color)
- Sufficient color contrast ratios (WCAG AA)

## License

MIT
