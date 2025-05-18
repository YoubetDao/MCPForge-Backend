# MCPForge Frontend

[English](./README.md) | [中文](./README.zh.md)

MCPForge Frontend is a modern web application built with Next.js 15, featuring a rich set of UI components and functionalities.

## 🚀 Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Components**:
  - Radix UI (Core Components)
  - Tailwind CSS (Styling System)
- **State Management**: React Hook Form
- **Authentication**: NextAuth.js
- **Other Tools**:
  - date-fns (Date Manipulation)
  - zod (Data Validation)
  - recharts (Charts Library)
  - ethers (Blockchain Integration)

## 📦 Installation

Make sure you have Node.js (Latest LTS version recommended) and pnpm installed in your development environment.

```bash
# Clone the repository
git clone https://github.com/YoubetDao/MCPForge.git

# Navigate to project directory
cd frontend

# Install dependencies
pnpm install
```

## 🔧 Development

```bash
# Start development server
pnpm dev

# Build project
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## 🌲 Project Structure

```
frontend/
├── .next/              # Next.js build output
├── app/                # Application routes and pages
├── components/         # React components
├── hooks/             # Custom React Hooks
├── lib/               # Utility functions and libraries
├── public/            # Static assets
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── dictionaries/      # Internationalization texts
```

## 🔐 Environment Variables

Create a `.env.local` file and configure the following environment variables:

```env
# Example environment variables
NEXT_PUBLIC_API_URL=your_api_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_auth_url
```

## 📚 Key Features

- Modern User Interface
- Responsive Design
- Authentication System
- Internationalization Support
- Blockchain Integration
- Theme Switching

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
