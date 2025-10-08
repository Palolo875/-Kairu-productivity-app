# Kairu - Productivity App

## Overview
A Next.js 15 productivity application with task management, energy tracking, insights dashboard, and speech recognition features. The app uses React 19, TailwindCSS, and various Radix UI components for a polished user interface.

## Recent Changes

### 2025-10-08: Vercel to Replit Migration
- **Configured Replit Environment**: Updated package.json scripts to use port 5000 and host 0.0.0.0 for Replit compatibility
- **Dependency Fixes**: 
  - Removed non-existent `web-speech-api` package
  - Added `react-is` package (required by recharts)
  - Updated speech recognition hook to use native browser Web Speech API with proper TypeScript types
- **Development Workflow**: Configured npm run dev workflow on port 5000
- **Deployment Configuration**: Set up autoscale deployment with build and start commands
- **CORS Configuration**: Added experimental allowedDevOrigins to next.config.mjs for Replit preview domains

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Runtime**: React 19
- **Styling**: TailwindCSS 4.1.9
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics

### Key Features
- Task management with drag-and-drop (dnd-kit)
- Daily notes and journaling
- Energy level tracking
- Insights dashboard with analytics
- Speech recognition for voice input
- Weekly view and archives
- Onboarding quiz
- Theme support (next-themes)

### Project Structure
```
/app - Next.js app directory
/components - React components including UI primitives
/hooks - Custom React hooks (speech recognition, etc)
/lib - Utility functions and helpers
/types - TypeScript type definitions
/public - Static assets
```

## Configuration

### Package Manager
- Using npm with `--legacy-peer-deps` for React 19 compatibility

### Development
- Server runs on port 5000 with host 0.0.0.0
- Hot reload enabled
- TypeScript and ESLint configured to ignore build errors (inherited from Vercel setup)

### Deployment
- Deployment target: autoscale (serverless)
- Build command: `npm run build`
- Start command: `npm run start`
- Images: unoptimized for compatibility

## Known Issues
- Next.js cross-origin warning appears in logs: This is a known Next.js experimental feature limitation. The warning is informational only and doesn't affect functionality. It says "In a future major version" so no action is needed until Next.js updates their implementation.
- React 19 requires legacy peer deps for some packages (vaul)
- TypeScript build errors are ignored per original configuration

## User Preferences
- App is in French (UI text and speech recognition configured for fr-FR)
- Productivity-focused design with energy tracking
