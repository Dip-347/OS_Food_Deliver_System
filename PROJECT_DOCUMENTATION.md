# Foodloop - Complete Project Documentation

Foodloop is a modern, real-time, multi-role Food Delivery System. This document serves as the comprehensive overview of the system's architecture, technology stack, database schema, user workflows, and core algorithms.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Maps & Geolocation:** Leaflet, React-Leaflet, HTML5 Geolocation API
- **Icons & UI:** Lucide React, Custom CSS/SVG Map Pins
- **Data Visualization:** Recharts (for analytics and dashboards)

### Backend & Database
- **Provider:** Supabase (BaaS)
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth (Email/Password)
- **Real-time:** Supabase Realtime (WebSockets for live GPS tracking)
- **Security:** Row Level Security (RLS) policies

---

## 2. Core Architecture & User Roles

The system is strictly divided into four distinct user roles, each with their own dedicated portal and functionality:

### 1. Customer
- **Discovery:** Browse a curated list of local restaurants and their specific menus.
- **Cart & Checkout:** Add items to a global state cart. During checkout, users can use the HTML5 Geolocation API ("Use Current Location" button) to automatically pinpoint their delivery coordinates.
- **Live Tracking:** Once an order is dispatched, the customer can watch their courier travel in real-time on a dedicated `<CustomerTrackingMap>` using WebSocket broadcasts.
- **Delivery Verification:** Receives a 4-digit OTP to provide to the rider upon successful delivery.

### 2. Restaurant
- **Order Management:** View incoming orders in real-time. Accept or reject orders based on capacity.
- **Status Updates:** Update order statuses (`preparing`, `ready_for_pickup`).
- **Dashboard:** Track daily revenue, order volume, and top-selling items.

### 3. Delivery Courier (Rider)
- **Smart Dispatch:** Receives automated task assignments based on proximity to the restaurant.
- **Rider Map Dashboard:** A split-screen UI featuring an interactive task list and an integrated Leaflet map. 
- **Real-Time GPS:** The dashboard utilizes `navigator.geolocation.watchPosition` to lock onto the rider's physical movement, updating the map's origin point dynamically.
- **Delivery Verification:** Inputs the customer's 4-digit OTP to securely mark the order as `delivered`.

### 4. Administrator (Admin)
- **Oversight:** View all system metrics including total users, active riders, and platform revenue.
- **Simulation:** Has access to a simulation view to manually test the SSTF dispatch algorithm and visualize the entire city's network of orders and riders.

---

## 3. Key Algorithmic Features

### SSTF (Shortest Seek Time First) Dispatch Algorithm
Inspired by Operating System disk scheduling, Foodloop employs a geographic SSTF algorithm to optimize delivery efficiency. 
- When an order becomes `ready_for_pickup`, the system queries the active `riders` table.
- It calculates the Euclidean distance between the restaurant's coordinates and every available rider's `current_lat`/`current_lng`.
- The rider with the shortest absolute distance is automatically assigned the order, minimizing wait times and fuel consumption.

### High-Fidelity Real-Time Tracking
To ensure the customer map reflects the rider's movement without stuttering or draining resources, the tracking flow is highly optimized:
- **Fresh Hardware Data:** The rider's app bypasses stale GPS caches by forcing `maximumAge: 0`.
- **WebSocket Broadcasts:** Location updates are sent directly over Supabase Realtime Channels (`channel.send`), bypassing standard REST API polling.
- **Client-Side Throttling:** The WebSocket broadcasts are throttled to exactly 1000ms. This prevents the customer's React state from re-rendering excessively, guaranteeing a perfectly smooth marker transition on the map.
- **Rate-Limited DB Writes:** While WebSockets update the UI every 1 second, the heavy PostgreSQL `UPDATE` commands are rate-limited to once every 5 seconds to preserve database bandwidth.

---

## 4. UI/UX & Map Aesthetics

The mapping engine relies on `react-leaflet` but overrides the default, outdated map markers with a modern 3D aesthetic:
- **Custom CSS Map Pins:** The Restaurant and Customer icons are drawn entirely via CSS as teardrop-shaped pins.
- **SVG Injection:** Inside the CSS pins, high-resolution Lucide SVGs (a blue user icon for customers, an orange fork/spoon for restaurants) scale infinitely without pixelation.
- **Expressive Courier:** The courier is represented by an expressive, drop-shadowed motor scooter emoji (`🛵`) for instant recognition.

---

## 5. Database Schema Overview

- **`public.users`**: Mirrors `auth.users` via database triggers. Stores core identity (email, full_name, role).
- **`public.restaurants`**: Stores restaurant profiles, including `name`, `description`, `image_url` (for frontend grids), and exact geographic coordinates (`lat`, `lng`). Links back to `public.users` via `user_id`.
- **`public.menu_items`**: Contains the food inventory, categorized and priced, linked to a `restaurant_id`.
- **`public.riders`**: Maintains the courier fleet's status (`available`, `busy`) and their real-time `current_lat`/`current_lng` for the SSTF algorithm.
- **`public.orders`**: The core transactional table linking a `customer_id` and `restaurant_id`. Tracks the financial total, lifecycle `status`, assigned `rider_id`, `delivery_otp`, and exact drop-off coordinates.

---

## 6. Local Development & Setup

### Environment Variables
To run this project locally, ensure you have a `.env` file in the `/frontend` directory containing:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Database Seeding
The project contains several raw SQL scripts to initialize the Supabase database perfectly:
- `init_schema.sql` - Bootstraps the core tables and RLS policies.
- `phase3_rls_policies.sql` & `phase4_migration.sql` - Updates tables to support the Delivery Manager flows, OTPs, and the `riders` tracking table.
- `seed_chattogram_restaurants.sql` - Seeds 11 authentic restaurant profiles centered precisely in Chattogram, Bangladesh.
- `seed_restaurant_metadata_menus.sql` - Enriches the restaurants with Unsplash imagery and populates the `menu_items` table with 33 unique, cuisine-accurate dishes. 

Execute these scripts directly in the Supabase SQL Editor to populate your local development environment.
