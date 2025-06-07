# Dayli - Shared Journal for Couples

A beautiful and secure shared journal application for couples to document their journey together.

## 🌟 Features

- **Shared Journal**: Write and share daily entries with your partner
- **Memory Collection**: Upload and organize your favorite photos and memories
- **Relationship Milestones**: Track important dates and achievements
- **Secure Storage**: All data is encrypted and securely stored
- **Real-time Sync**: Changes appear instantly for both partners
- **Relationship Duration**: Track your time together in YY:MM:DD format

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **File Storage**: MinIO (self-hosted S3-compatible storage)
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS with custom Dayli theme

## 📁 Project Structure

```
Dayli/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── services/      # API and external service integrations
│   ├── utils/         # Utility functions and helpers
│   └── lib/           # Configuration files (Firebase, etc.)
├── server/            # Server-side API endpoints
├── docs/              # Documentation files
├── public/            # Static assets
└── dist/              # Production build output
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayli
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:8080`

## 📋 Setup Scripts

- `setup.sh` - Basic setup script for development
- `setup-complete.sh` - Complete setup including Firebase and MinIO
- `security-test.sh` - Security validation tests
- `secure-deploy.sh` - Production deployment with security checks

## 🔐 Security Features

- Firebase Security Rules for data protection
- File type validation for uploads
- Encrypted data storage
- Secure authentication flow
- Environment variable protection

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Security Guide](./SECURITY.md) - Security implementation details
- [API Documentation](./API.md) - Server endpoints and services
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment guide
- [Contributing](./CONTRIBUTING.md) - Development guidelines

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 💕 About Dayli

Dayli is designed to help couples strengthen their relationship by encouraging daily reflection and shared memories. The application focuses on privacy, security, and creating a beautiful space for couples to document their journey together.
