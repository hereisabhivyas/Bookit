# BookIt Admin Dashboard

Admin panel for managing the BookIt event booking platform.

## Features

- **Dashboard**: Overview of key metrics and statistics
- **User Management**: View and manage all registered users
- **Venue Management**: Monitor active venues and their events
- **Host Requests**: Review and approve venue registration requests
- **Authentication**: Secure admin login

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the admin panel at `http://localhost:5173`

## Default Login Credentials

- **Email**: admin@bookit.com
- **Password**: admin123

## Tech Stack

- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React Icons

## Available Routes

- `/login` - Admin login page
- `/dashboard` - Main dashboard
- `/users` - User management
- `/venues` - Venue management
- `/host-requests` - Host registration requests

## Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.
