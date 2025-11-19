# MedCharting

A medical clinic charting application for capturing and managing patient information.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Drawing**: HTML5 Canvas API

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable shadcn/ui components
│   ├── sections/        # Main chart sections (PatientInfo, BodyChart, etc.)
│   ├── Header.tsx       # Top navigation bar
│   └── PatientSidebar.tsx
├── lib/
│   ├── utils.ts         # cn() utility for class merging
│   └── supabase.ts      # Supabase client and TypeScript types
├── App.tsx              # Main application component
└── index.css            # Tailwind directives and CSS variables
```

## Key Features

1. **Patient Information** - Basic patient data (name, DOB, gender, contact)
2. **Primary Complaint** - Text area for chief complaint with draft/signed status
3. **Body Chart** - Canvas drawing tool with body silhouettes for marking symptoms
4. **File Upload** - Drag-and-drop file uploads with descriptions

## Development

```bash
npm install
npm run dev     # Start dev server
npm run build   # Production build
```

## Environment Variables

Copy `.env.example` to `.env` and add your Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database

Run `supabase-schema.sql` in your Supabase SQL editor to create the required tables:
- `patients`
- `chart_entries`
- `body_chart_drawings`
- `file_uploads`

## Design

- Primary color: Teal (#0891b2 / hsl 174 72% 45%)
- Reference designs in `/reference` folder
- Follows the Jane App style interface
