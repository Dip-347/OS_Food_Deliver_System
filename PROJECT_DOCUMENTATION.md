# OS Food Delivery System - Project Documentation

## Project Overview
The **OS Food Delivery System** is a food delivery web application that uniquely integrates Operating System (OS) concepts (such as process scheduling and disk scheduling algorithms) into its core business logic and theme. 

The platform supports a multi-role ecosystem, including:
- **Customers**: Browse menus, place orders, and track deliveries.
- **Restaurants**: Manage menus and fulfill incoming orders.
- **Delivery Riders (Riders)**: Receive and complete deliveries using location-based dispatching.
- **Administrators**: Oversee the platform.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, React Router, React-Leaflet (for maps/location), Recharts (for analytics), Lucide React (icons).
- **Backend**: Supabase (PostgreSQL), utilizing Row Level Security (RLS) for data protection, and Realtime features for live updates.
- **Database Functions & Triggers**: Advanced PL/pgSQL scripts for automated assignment and workflow management.

## Key Features & Implementations

### 1. OS-Themed Business Logic
- **Menu Items**: Themed around OS concepts, e.g., "FCFS Burger" (First Come, First Served), "SSTF Fries" (Shortest Seek Time First), "SCAN Pepperoni", and "LOOK Margherita".
- **SSTF Dispatching Algorithm**: Implemented a "Shortest Seek Time First" dispatching system using a PostgreSQL trigger (`trigger_assign_rider`). When a new order is placed, the backend calculates the Haversine distance between the restaurant and all available riders, automatically assigning the order to the closest rider within a 5km radius.

### 2. Multi-Role Architecture
- **Authentication**: Trigger-based user profile creation (`handle_new_user`) that syncs Supabase Auth with a custom `users` table, setting roles (`customer`, `restaurant`, `rider`, `admin`).
- **Row Level Security (RLS)**: Enforced database-level security policies tailored to each user role, ensuring users can only read/modify data pertinent to them.

### 3. Database Schema Evolution
The project has evolved through several migration phases, managed via `.sql` files:
- `init_schema.sql`: Initialized core tables (`users`, `restaurants`, `menu_items`, `orders`, `order_items`) and inserted mock data.
- `sstf_dispatch_setup.sql`: Added geographical coordinates (`lat`, `lng`) to restaurants and riders, and implemented the SSTF dispatching logic.
- `update_workflow_schema.sql` / `phase3_refactor.sql` / `phase4_migration.sql` / `phase6_admin_migration.sql`: Iteratively refined schemas, adding delivery coordinates, chat policies, OTP validation for pickups, and fixing RLS permissions.

### 4. Frontend Structure
- **Components (`frontend/src/components/`)**: Segmented by role (`admin`, `customer`, `deliveryBoy`, `restaurant`, `shared`).
- **Pages (`frontend/src/pages/`)**: Includes unified dashboards, login, password reset, and home pages.

## Recent Updates (Phase 3 & 4)
- **Refactoring**: Renamed `owner_id` to `user_id` in the `restaurants` table for better consistency.
- **Security & Fixes**: Patched chat policies, fixed rider schema permissions, and optimized order assignment.
- **Realtime**: Enabled Supabase realtime functionality for critical tables to support live order tracking and dispatching.
