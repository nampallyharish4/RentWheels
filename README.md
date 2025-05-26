# Vehicle Rental System

A modern web application for managing vehicle rentals, built with React, TypeScript, and Supabase.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Vehicle Rental System is a web-based application that provides a seamless interface for managing vehicle rentals. Built with modern technologies, it offers a responsive and user-friendly experience for both administrators and customers.

### Key Features

- User authentication and authorization
- Vehicle management
- Booking system
- Real-time data updates using Supabase
- Responsive design with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd vehicle-rental-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory
   - Add your Supabase configuration:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
vehicle-rental-system/
├── src/                    # Source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── store/            # State management (Zustand)
│   ├── lib/              # Utility functions and configurations
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── supabase/            # Supabase configurations
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Usage

After installation, you can:

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Build for production:

   ```bash
   npm run build
   ```

3. Preview production build:

   ```bash
   npm run preview
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

## Documentation

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Backend/Database**: Supabase
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Build Tool**: Vite

### Component Documentation

The project uses TypeScript for type safety and self-documentation. Component props and interfaces are documented using TypeScript interfaces.

### API Documentation

API endpoints and database schema documentation can be found in the Supabase dashboard.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
