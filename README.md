# Dayli 💕

A beautiful and secure shared journal application for couples to document their journey together.

![Dayli Logo](public/Dayli.png)

## ✨ Features

- **📝 Shared Journal**: Write and share daily entries with your partner
- **📸 Memory Collection**: Upload and organize your favorite photos and memories
- **🎯 Relationship Milestones**: Track important dates and achievements
- **🔐 Secure Storage**: All data is encrypted and securely stored
- **⚡ Real-time Sync**: Changes appear instantly for both partners
- **⏰ Relationship Duration**: Track your time together in YY:MM:DD format
- **🎨 Beautiful UI**: Modern, responsive design with smooth animations

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayli
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup-complete.sh
   ./setup-complete.sh
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions
- **[Security Guide](docs/SECURITY.md)** - Security implementation details
- **[API Documentation](docs/API.md)** - Server endpoints and services
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment guide
- **[Contributing](docs/CONTRIBUTING.md)** - Development guidelines

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **File Storage**: MinIO (self-hosted S3-compatible storage)
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS with custom theme

## 📱 Pages

- **Dashboard**: Overview of your relationship journey
- **Journal**: Daily entries with mood tracking
- **Memories**: Photo gallery with metadata
- **Milestones**: Important relationship events
- **Settings**: User preferences and relationship setup

## 🔐 Security Features

- **Firebase Security Rules** for data protection
- **File type validation** for uploads
- **Encrypted data storage**
- **Secure authentication flow**
- **Environment variable protection**
- **Partner-only access controls**

## 🎨 Design System

Dayli uses a custom design system with:
- **Warm color palette** (blush, cream, coral tones)
- **Smooth animations** with Framer Motion
- **Responsive design** for all devices
- **Accessibility** features built-in

## 📁 Project Structure

```
Dayli/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── services/      # API and external service integrations
│   ├── utils/         # Utility functions and helpers
│   └── lib/           # Configuration files
├── server/            # Server-side API endpoints
├── docs/              # Comprehensive documentation
└── public/            # Static assets
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run security tests
./security-test.sh

# Check for errors
npm run type-check
```

## 🚀 Deployment

Use the secure deployment script:

```bash
chmod +x secure-deploy.sh
./secure-deploy.sh
```

See the [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for:

- Development setup
- Code standards
- Security guidelines
- Pull request process

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Questions**: Use GitHub Discussions
- **Security**: Contact maintainers privately for security issues

## 📋 Requirements

- **Node.js**: 18+ or Bun
- **Firebase**: Project with Firestore and Authentication
- **MinIO**: Server or S3-compatible storage
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🔄 Recent Updates

- ✅ Enhanced Firebase security rules
- ✅ Improved journal entry fetching
- ✅ YY:MM:DD relationship duration format
- ✅ Comprehensive documentation
- ✅ Production-ready deployment scripts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💕 About

Dayli is designed to help couples strengthen their relationship by encouraging daily reflection and shared memories. The application focuses on privacy, security, and creating a beautiful space for couples to document their journey together.

---

**Made with 💕 for couples everywhere**
