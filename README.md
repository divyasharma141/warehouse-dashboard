Bot Fleet Management Dashboard
Live Application: []

# Login Details 
- demo@delhivery.com
- Password123
# Project Overview
A comprehensive dashboard for managing and monitoring an autonomous bot fleet with real-time task allocation, analytics, and warehouse visualization. The system simulates 10 bots with varying statuses, battery levels, and tasks, providing real-time insights into fleet performance.

# Tech Stack
Frontend
React 18 - UI library with hooks
Tailwind CSS - Utility-first CSS framework
React Router v6 - Navigation and routing
React Icons - Icon library for UI elements
Context API - Built-in React state management

# Development Tools
Node.js (v16+) - JavaScript runtime
npm - Package manager
Vite  - Build tool
Prettier - Code formatter
No backend required - runs completely in browser

# Design Features:
Complete Component Library
Button variations (primary, secondary, success, danger, outline)
Card components with multiple states
Form elements and inputs
Data tables with sorting and filtering
Status badges and indicators


# Color System
Primary: Blue (#3B82F6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Danger: Red (#EF4444)
Neutral: Gray (#6B7280)

# Typography Scale
Headings: Inter (Bold)
Body: Inter (Regular)
Monospace: Roboto Mono

# Pages Designed:
Dashboard Overview - Key metrics and quick stats
Bot Status Page - Bot fleet monitoring
Task Management - Queue and assignment system
Analytics - Performance insights and charts
Warehouse Map - Visual bot tracking
Interactive Prototypes:
Clickable navigation
Form interactions
Filter and sort functionality
Mobile-responsive layouts

## Architecture
Component Structure

1. common/              # Reusable UI components
       Button.jsx       # Button with variants
       Card.jsx         # Content container
       DataTable.jsx    # Table with sorting
       FilterBar.jsx    # Filter controls
       KPICard.jsx      # Statistic cards
       PageHeader.jsx   # Page headers
       ProgressBar.jsx  # Progress indicators
       StatusBadge.jsx  # Status labels
       StatsGrid.jsx    # Grid of stats
       BotCard.jsx          # Bot-specific component

2. context
    Auth Context
    GlobalState.jsx      # Central state management

3. pages
        DashboardOverview.jsx
        BotStatusPage.jsx
        TaskManagementPage.jsx
        AnalyticsPage.jsx
        MapPage.jsx
4. App.jsx                  # Main app with routing

5. AppRoutes
        Protected Routes Which are only accessible when logged in
        Public Routes are all time accessible 

# Designing 
Templates: Page layouts
Pages: Complete screens
Responsive Strategy
Mobile-first approac
Flexbox and Grid layouts
Conditional rendering for mobile
Accessibility
Semantic HTML
ARIA labels
Keyboard navigation
Color contrast compliance



### Key Features
1. Real-time Dashboard
Live bot status monitoring
Battery level tracking
Task queue visualization
Performance metrics

2. Smart Task Management
Automatic task assignment (every 3s)
Priority-based scheduling
Manual override capability
Assignment history tracking

3. Interactive Warehouse Map
SVG-based warehouse layout
Real-time bot movements
Status-based movement patterns
Bot selection and details

4. Comprehensive Analytics
Bot utilization metrics
Battery health analysis
Task completion rates
Performance trends

5. Responsive Design
Mobile-first approach
Touch-friendly interfaces
Adaptive layouts
Consistent UX across devices

🎯 Design System Details
Color Palette
css
1. Primary Colors 
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-700: #1d4ed8;

2. Status Colors 
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;

3. Neutral Colors
--gray-50: #f9fafb;
--gray-500: #6b7280;
--gray-900: #111827;

4. Status Color Guide
🟢 Green: Active/Busy
🟡 Yellow: Idle/Available
🔵 Blue: Charging
🔴 Red: Error/Stopped

5. Priority Levels
🔴 High: Urgent tasks
🟡 Medium: Normal priority
🟢 Low: Background tasks