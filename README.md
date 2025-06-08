# Vehicle Rental System (RentWheels)

A modern web application for managing vehicle rentals, built with React, TypeScript, and Supabase. RentWheels provides a comprehensive solution for vehicle rental businesses to manage their fleet, bookings, and customer interactions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

RentWheels is a full-featured vehicle rental management system designed to streamline the process of renting vehicles. The application provides an intuitive interface for both administrators and customers, making it easy to manage vehicle inventory, handle bookings, and process payments.

### Key Features

- **User Management**

  - Secure authentication and authorization
  - User roles (Admin, Staff, Customer)
  - Profile management
  - Password recovery

- **Vehicle Management**

  - Comprehensive vehicle catalog
  - Real-time availability tracking
  - Vehicle categories and filtering
  - Maintenance scheduling
  - Vehicle status updates

- **Booking System**

  - Real-time booking calendar
  - Automated availability checks
  - Flexible rental periods
  - Price calculation
  - Booking modification and cancellation

- **Admin Dashboard**

  - Fleet overview
  - Booking management
  - Revenue analytics
  - User management
  - System settings

- **Customer Features**
  - Easy booking process
  - Rental history
  - Favorite vehicles
  - Reviews and ratings

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git
- Supabase account
- Modern web browser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rentwheels.git
   cd rentwheels
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=your_api_base_url
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

2. Configure Supabase:
   - Set up authentication providers
   - Create necessary database tables
   - Configure storage buckets
   - Set up row level security policies

## Project Structure

```
rentwheels/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Shared components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   └── vehicles/     # Vehicle-related components
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── auth/         # Authentication pages
│   │   └── public/       # Public pages
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── lib/              # Utility functions
│   │   ├── api/         # API client
│   │   ├── supabase/    # Supabase client
│   │   └── utils/       # Helper functions
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── tests/                # Test files
├── supabase/             # Supabase configurations
├── config/               # Configuration files
├── scripts/              # Build and utility scripts
└── docs/                 # Additional documentation
```

## Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Run tests:

   ```bash
   npm run test
   ```

3. Lint code:

   ```bash
   npm run lint
   ```

4. Format code:
   ```bash
   npm run format
   ```

## Testing

- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- Coverage report: `npm run test:coverage`

## Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Preview production build:

   ```bash
   npm run preview
   ```

3. Deploy to production:
   - Configure deployment platform (Vercel, Netlify, etc.)
   - Set up environment variables
   - Deploy using platform-specific commands

## API Documentation

### Authentication Endpoints

- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/logout` - User logout
- POST `/auth/reset-password` - Password reset

### Vehicle Endpoints

- GET `/vehicles` - List all vehicles
- GET `/vehicles/:id` - Get vehicle details
- POST `/vehicles` - Create new vehicle (Admin)
- PUT `/vehicles/:id` - Update vehicle (Admin)
- DELETE `/vehicles/:id` - Delete vehicle (Admin)

### Booking Endpoints

- GET `/bookings` - List user bookings
- POST `/bookings` - Create new booking
- PUT `/bookings/:id` - Update booking
- DELETE `/bookings/:id` - Cancel booking

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Submit a pull request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the code review process

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:

- Check the [Issues](https://github.com/yourusername/rentwheels/issues) page
- Join our [Discord community](https://discord.gg/rentwheels)
- Email support at: support@rentwheels.com

---

© 2024 RentWheels. All rights reserved.
