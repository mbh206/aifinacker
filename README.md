# Financial Tracker Application

A comprehensive financial tracking application that allows users to manage expenses, budgets, and gain insights across multiple accounts. The app serves various use cases - from family budgeting to team expense tracking to business petty cash management.

## Features

- Multi-account management
- Expense tracking with receipt uploads
- Multi-currency support
- AI-powered insights and recommendations
- Budget management by category and time period
- User collaboration with role-based permissions
- Mobile-first responsive design
- Dark mode support

## Tech Stack

- **Framework**: Next.js with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Authentication & Database**: Firebase (Auth, Firestore, Storage)
- **Data Visualization**: Chart.js
- **Forms**: Formik with Yup validation
- **Currency Conversion**: Exchange Rate API

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Git
- Firebase account
- Currency exchange API key

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/financial-tracker.git
   cd financial-tracker
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Firebase and API credentials

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

```
financial-tracker/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Next.js pages
│   ├── services/     # API and external service integrations
│   ├── store/        # Redux store setup and slices
│   ├── styles/       # Global styles
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── .env.local        # Environment variables (not in repo)
├── .gitignore        # Git ignore file
├── next.config.js    # Next.js configuration
├── package.json      # Project dependencies
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json     # TypeScript configuration
```

## Deployment

The application can be deployed to Vercel with the following steps:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in the Vercel dashboard
3. Deploy the application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
