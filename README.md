# Dayli 💕

**A beautiful and secure shared journal application for couples to document their journey together.**

![Dayli Logo](public/Dayli.png)

> *Craft your shared journal of moments, milestones and memories* ✨

---

## 🌟 Overview

Dayli is a modern, secure, and beautifully designed journal application built specifically for couples. It provides a private space to document your relationship journey through daily entries, photo memories, and milestone tracking. With real-time synchronization, cloud storage integration, and robust security features, Dayli ensures your precious moments are safely preserved and easily accessible.

## ✨ Core Features

### 📝 **Shared Journal**
- **Daily Entries**: Write and share daily thoughts, feelings, and experiences
- **Mood Tracking**: Tag entries with emotions (happy, excited, calm, grateful, anxious, sad)
- **Rich Text Support**: Format your entries with beautiful typography
- **Automatic Timestamps**: Every entry is timestamped and organized chronologically

### 🔒 **Security & Privacy**
- **Firebase Authentication**: Secure user management
- **End-to-End Encryption**: Your data is protected at every level
- **Private Sharing**: Only you and your partner can access your journal
- **Secure Cloud Storage**: MinIO integration with AWS S3 compatibility

### 🎨 **Modern Design**
- **Beautiful UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Responsive Design**: Perfect experience on desktop and mobile
- **Dark/Light Mode**: Switch between themes
- **Smooth Animations**: Delightful interactions and transitions

---

## 🚀 Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** for beautiful components
- **React Router** for navigation
- **React Query** for data management
- **Framer Motion** for animations

### **Backend & Database**
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for secure user management
- **MinIO** for object storage (S3 compatible)
- **Express.js** API server for presigned URLs

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Concurrently** for running multiple servers
- **Vitest** for testing

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore enabled
- MinIO server (Docker recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This runs both the Vite dev server (port 8080) and MinIO API server (port 3001) concurrently.

### Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# MinIO Configuration
VITE_MINIO_ENDPOINT=localhost
VITE_MINIO_PORT=9000
VITE_MINIO_ACCESS_KEY=minioadmin
VITE_MINIO_SECRET_KEY=minioadmin123
VITE_MINIO_BUCKET_NAME=dayli-uploads
VITE_MINIO_USE_SSL=false
```

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Deployment Options

#### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### **Manual Deployment**
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

---

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   └── ui/             # UI components (buttons, cards, etc.)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── firebase.ts    # Firebase configuration
│   ├── minio.ts       # MinIO client
│   └── storage-*.ts   # Storage implementations
├── pages/              # Page components
├── services/           # Business logic and API calls
├── styles/             # Global styles
└── utils/              # Utility functions

server/
└── presigned-url-api.cjs  # MinIO presigned URL server

docs/
├── API.md              # API documentation
├── DEPLOYMENT.md       # Deployment guide
├── SECURITY.md         # Security guidelines
└── SETUP.md            # Setup instructions
```

---

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers (Vite + API) |
| `npm run dev:vite` | Start only Vite dev server |
| `npm run dev:api` | Start only MinIO API server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📸 Features Overview

### **Dashboard**
- Activity overview and recent entries
- Quick access to all features
- Mood tracking visualization

### **Journal**
- Daily entry creation and editing
- Mood selection and tagging
- Search and filter capabilities

### **Memories**
- Photo and GIF upload
- Memory gallery with favorites
- Secure cloud storage

### **Milestones**
- Important date tracking
- Anniversary reminders
- Achievement celebrations

### **Settings**
- Profile management
- Theme preferences
- Privacy controls

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💡 Support

If you encounter any issues or have questions:

1. Check our [Documentation](docs/)
2. Search existing [Issues](../../issues)
3. Create a new issue if needed

---

**Built with ❤️ for couples who want to cherish their journey together**
- **Real-time Sync**: Changes appear instantly for both partners

### 📸 **Memory Collection**
- **Photo Gallery**: Upload and organize your favorite photos and memories
- **Secure Storage**: Files stored using MinIO S3-compatible secure storage
- **Search & Filter**: Find memories by date, tags, or favorites
- **Multiple Views**: Grid and masonry layout options
- **Metadata Support**: Add titles, descriptions, dates, and locations
- **Favorite System**: Mark special memories as favorites

### 🎯 **Relationship Milestones**
- **Important Dates**: Track anniversaries, achievements, and special moments
- **Automatic Milestones**: System generates milestones based on relationship duration
- **Custom Events**: Add your own special dates and achievements
- **Visual Timeline**: Beautiful chronological display of your journey
- **Achievement Celebrations**: Animated celebrations for new milestones

### ⏰ **Relationship Tracking**
- **Duration Display**: See your time together in human-readable format
- **Milestone Calculations**: Automatic milestone generation based on relationship start date
- **Anniversary Reminders**: Visual countdown to important dates

### 🔐 **Security & Privacy**
- **Firebase Authentication**: Secure login with email/password
- **End-to-End Privacy**: Data accessible only to you and your partner
- **Secure File Storage**: Encrypted file uploads with MinIO
- **Security Rules**: Comprehensive Firebase security rules
- **Session Management**: Automatic logout on token expiry
- **Input Validation**: All user inputs are validated and sanitized

### 🎨 **Beautiful Design**
- **Modern UI**: Clean, intuitive interface with Radix UI components
- **Warm Color Palette**: Blush, cream, coral, and lavender tones
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Accessibility**: Built-in accessibility features

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** or **Bun**
- **Firebase Project** (Firestore + Authentication)
- **MinIO Server** or S3-compatible storage
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dayli
   ```

2. **Automated Setup** (Recommended)
   ```bash
   chmod +x setup-complete.sh
   ./setup-complete.sh
   ```

3. **Manual Setup** (Alternative)
   ```bash
   # Install dependencies
   npm install  # or: bun install
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your Firebase and MinIO credentials
   
   # Start development server
   npm run dev  # or: bun dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080` (or the port shown in terminal)

### Environment Configuration

Create a `.env` file with your configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# MinIO Configuration
VITE_MINIO_ENDPOINT=localhost:9000
VITE_MINIO_ACCESS_KEY=your_access_key
VITE_MINIO_SECRET_KEY=your_secret_key
VITE_MINIO_BUCKET_NAME=dayli-memories
VITE_MINIO_USE_SSL=false
```

## 🛠️ Technology Stack

### Frontend Architecture
- **⚛️ React 18** - Modern React with hooks and functional components
- **🔷 TypeScript** - Type-safe development with full type coverage
- **⚡ Vite** - Lightning-fast build tool and dev server
- **🎨 Tailwind CSS** - Utility-first styling with custom Dayli theme
- **🎭 Framer Motion** - Smooth animations and transitions
- **🧩 Radix UI + shadcn/ui** - Accessible, customizable UI components

### Backend & Data
- **🔥 Firebase Firestore** - NoSQL database with real-time sync
- **🔐 Firebase Authentication** - Secure user authentication
- **📁 MinIO** - Self-hosted S3-compatible object storage
- **🔄 TanStack Query** - Data fetching and state management
- **📊 Redis** - Caching and session management (optional)

### Development & Build
- **📋 ESLint** - Code linting with TypeScript support
- **🎯 Vitest** - Fast unit testing framework
- **📦 pnpm/npm/bun** - Package manager flexibility
- **🐳 Docker** - Containerization for deployment
- **🚀 GitHub Actions** - CI/CD pipeline

## 📱 Application Structure

### Core Pages

#### 🏠 **Dashboard**
- **Relationship overview** with duration tracking
- **Recent journal entries** (last 3) with excerpts
- **Memory board** showcasing recent photos
- **Mood selector** for quick daily check-ins
- **"Send love" button** with floating hearts animation

#### 📖 **Journal**
- **Entry composer** with mood selection
- **Chronological feed** of all journal entries
- **Real-time saving** with visual feedback
- **Entry filtering** and search capabilities
- **Offline support** with localStorage fallback

#### 📸 **Memories**
- **Photo upload** with drag-and-drop support
- **Gallery views** (grid and masonry layouts)
- **Search and filtering** by favorites, dates, or text
- **Lightbox viewer** with navigation
- **Metadata editing** (title, description, date, location)

#### 🏆 **Milestones**
- **Timeline view** of relationship milestones
- **Automatic milestones** (30 days, 6 months, 1 year, etc.)
- **Custom milestone creation** with date picker
- **Achievement celebrations** with confetti animations
- **Milestone categories** (anniversary, achievement, travel, other)

#### ⚙️ **Settings**
- **Profile management** with photo upload
- **Relationship date configuration** for milestone calculations
- **Dark mode toggle** with system preference detection
- **Privacy controls** and data management
- **Account settings** (email, password, display name)

### Component Architecture

```
src/
├── components/
│   ├── ui/                  # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── JournalCard.tsx  # Custom journal card component
│   │   ├── MoodPicker.tsx   # Mood selection component
│   │   ├── FloatingHearts.tsx
│   │   ├── MemoryGallery.tsx
│   │   └── ...
│   └── layout/              # Layout components
│       ├── MainLayout.tsx   # Main app layout
│       └── Navigation.tsx   # Navigation bar
├── pages/                   # Page components
│   ├── Dashboard.tsx
│   ├── Journal.tsx
│   ├── Memories.tsx
│   ├── Milestones.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── Welcome.tsx
├── services/                # API layer
│   ├── journalService.ts    # Journal CRUD operations
│   ├── journalService.local.ts  # Local storage fallback
│   ├── memoriesService.ts   # Memory management
│   ├── milestonesService.ts # Milestone tracking
│   └── secure-memories-service.ts
├── hooks/                   # Custom React hooks
│   ├── use-toast.ts
│   ├── use-secure-storage.ts
│   └── use-mobile.tsx
├── lib/                     # Configuration
│   ├── firebase.ts          # Firebase configuration
│   ├── minio.ts            # MinIO configuration
│   └── utils.ts            # Utility functions
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state
└── utils/                  # Helper functions
    ├── authStorage.ts      # Auth persistence
    ├── dateUtils.ts        # Date formatting
    └── formValidation.ts   # Input validation
```

## 🔐 Security Implementation

### Authentication Security
- **Firebase Authentication** with email/password
- **Secure session management** with automatic token refresh
- **Protected routes** with authentication guards
- **Automatic logout** on token expiry

### Data Protection
- **Firebase Security Rules** restricting access to partner data only
- **Input sanitization** for all user-generated content
- **File type validation** for uploads
- **Environment variable protection**
- **CORS configuration** for API endpoints

### Storage Security
- **Encrypted file storage** with MinIO
- **Presigned URLs** for secure file access
- **Rate limiting** on upload endpoints
- **File size and type restrictions**

### Privacy Controls
- **Partner-only access** to all data
- **Private entry options** (future feature)
- **Data export functionality**
- **Account deletion** with data cleanup

## 🎨 Design System

### Color Palette
```css
/* Dayli Custom Colors */
--journal-blush: #FFDEE2    /* Primary pink/blush */
--journal-lavender: #E8D8F5 /* Secondary purple */
--journal-skyblue: #C5E6FF  /* Accent blue */
--journal-cream: #FFF8F0    /* Background cream */
--journal-coral: #FFB5A7    /* Warm coral */
```

### Typography
- **Font Family**: System fonts with serif headings
- **Heading Styles**: `.font-serif` for titles
- **Body Text**: Clean, readable sans-serif
- **Size Scale**: Tailwind's responsive text sizing

### Animation Principles
- **Micro-interactions**: Button hover states, form feedback
- **Page transitions**: Smooth navigation between routes
- **Loading states**: Skeleton screens and spinners
- **Celebration animations**: Hearts, confetti for special moments

## 📖 API Documentation

### Journal Service
```typescript
// Save journal entry
await saveJournalEntry({
  content: string,
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful',
  authorId: string,
  authorName: string
});

// Get journal entries
const entries = await getJournalEntries(userId: string);
```

### Memory Service
```typescript
// Save memory with file
await saveMemory({
  title: string,
  description?: string,
  file: File,
  date: string,
  location?: string,
  tags: string[],
  authorId: string
});

// Get memories
const memories = await getMemories(userId: string);
```

### Milestone Service
```typescript
// Add milestone
await addMilestone({
  title: string,
  date: string,
  achieved: boolean,
  description?: string,
  createdBy: string
});

// Generate automatic milestones
await generateAutomaticMilestones(startDate: Date, userId: string);
```

## 🧪 Testing & Quality

### Testing Strategy
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run security tests
./security-test.sh

# Type checking
npm run type-check

# Linting
npm run lint
```

### Quality Assurance
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vitest** for unit testing
- **Security scanning** with automated tools

### Performance Monitoring
- **Bundle analysis** with Vite bundle analyzer
- **Core Web Vitals** tracking
- **Performance budgets** in CI/CD
- **Lighthouse audits** for optimization

## 🚀 Deployment

### Development
```bash
# Start development server
npm run dev

# Development with Docker
docker-compose up -d
```

### Production Deployment

#### Option 1: Automated Script
```bash
chmod +x secure-deploy.sh
./secure-deploy.sh
```

#### Option 2: Manual Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy server functions
firebase deploy --only functions
```

#### Option 3: Docker Deployment
```bash
# Build Docker image
docker build -t dayli-app .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

#### Firebase Configuration
1. Create Firebase project
2. Enable Firestore and Authentication
3. Configure security rules (use `firebase.rules`)
4. Set up hosting

#### MinIO Setup
```bash
# Install MinIO server
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Start MinIO server
minio server /data --console-address ":9001"
```

## 📚 Comprehensive Documentation

### Available Guides
- **📋 [Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **🔐 [Security Guide](docs/SECURITY.md)** - Security implementation and best practices
- **📡 [API Documentation](docs/API.md)** - Complete API reference
- **🚀 [Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **🤝 [Contributing Guide](docs/CONTRIBUTING.md)** - Development workflow and standards

### Additional Resources
- **Issue Templates** for bug reports and feature requests
- **Pull Request Templates** for contributing
- **Security Policy** for responsible disclosure
- **Code of Conduct** for community guidelines

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork the repository**
2. **Clone your fork**: `git clone <your-fork-url>`
3. **Install dependencies**: `npm install`
4. **Create feature branch**: `git checkout -b feature/amazing-feature`
5. **Make changes** and add tests
6. **Run tests**: `npm test`
7. **Commit changes**: `git commit -m 'Add amazing feature'`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open Pull Request**

### Contribution Guidelines
- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Security**: Consider security implications
- **Performance**: Maintain performance standards

### Feature Requests
- **High Priority**: Enhanced analytics, mobile app, data export
- **Medium Priority**: Theme customization, calendar integration
- **Low Priority**: Multi-language support, social features

## 🔄 Recent Updates & Roadmap

### ✅ Recent Improvements
- **Dashboard Enhancement**: Fixed relationship duration display
- **Journal Reliability**: Added localStorage fallback for offline support
- **Code Quality**: Resolved all ESLint errors and TypeScript issues
- **Package Updates**: Updated all dependencies to latest stable versions
- **Security**: Enhanced Firebase security rules and data validation
- **Documentation**: Comprehensive documentation overhaul

### 🚧 Current Development
- **Mobile Responsiveness**: Enhanced mobile experience
- **Performance Optimization**: Bundle size reduction and lazy loading
- **Feature Enhancements**: Advanced search and filtering
- **Testing Coverage**: Comprehensive test suite implementation

### 🎯 Future Roadmap
- **📱 Mobile App**: React Native companion app
- **🔔 Notifications**: Push notifications for special dates
- **📊 Analytics**: Relationship insights and mood trends
- **🎨 Themes**: Multiple theme options and customization
- **🌐 Offline**: Full offline functionality with sync
- **🔗 Integrations**: Calendar, social media, and backup services

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Setup
- **Node.js**: Latest LTS version
- **Package Manager**: Bun (faster) or npm
- **IDE**: VS Code with TypeScript and ESLint extensions
- **Browser**: Latest Chrome or Firefox for development

## 🆘 Support & Community

### Getting Help
- **📖 Documentation**: Start with our comprehensive docs
- **🐛 Bug Reports**: Use GitHub Issues with bug template
- **💡 Feature Requests**: Use GitHub Issues with feature template
- **❓ Questions**: Use GitHub Discussions for general questions
- **🔒 Security Issues**: Email maintainers privately

### Community Guidelines
- **Be Respectful**: Follow our Code of Conduct
- **Be Helpful**: Help others in discussions
- **Be Patient**: Allow time for responses
- **Be Specific**: Provide clear descriptions and examples

## 📄 License & Legal

### License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.

### Privacy Policy
- **Data Collection**: Only essential data for functionality
- **Data Storage**: Encrypted storage with user control
- **Data Sharing**: No data sharing with third parties
- **Data Rights**: Users own their data completely

### Terms of Service
- **Usage**: Personal use for couples only
- **Modifications**: Users may modify for personal use
- **Distribution**: Follow license terms for redistribution
- **Liability**: Software provided "as-is" without warranty

## 💕 About Dayli

### Our Mission
Dayli was created to help couples strengthen their relationships through daily reflection, shared memories, and milestone celebration. We believe that documenting your journey together creates deeper connections and lasting happiness.

### Core Values
- **Privacy First**: Your moments are yours alone
- **Security**: Enterprise-grade protection for personal data
- **Simplicity**: Beautiful, intuitive design for everyday use
- **Love**: Built with love, for love

### The Story
Dayli emerged from the simple idea that relationships grow stronger when couples actively document and celebrate their journey together. By providing a secure, beautiful space for daily reflection and memory preservation, we aim to help couples create lasting bonds and cherished memories.

---

## 🌟 Quick Links

| Resource | Description | Link |
|----------|-------------|------|
| 🏠 **Live Demo** | Try Dayli online | [demo.dayli.app](https://demo.dayli.app) |
| 📚 **Documentation** | Complete guides | [/docs](/docs) |
| 🐛 **Bug Reports** | Report issues | [GitHub Issues](https://github.com/user/dayli/issues) |
| 💡 **Feature Requests** | Suggest features | [GitHub Discussions](https://github.com/user/dayli/discussions) |
| 🔐 **Security** | Security policy | [SECURITY.md](SECURITY.md) |
| 🤝 **Contributing** | Contribution guide | [CONTRIBUTING.md](docs/CONTRIBUTING.md) |

---

**Made with 💕 for couples everywhere**

*Start your journey today and create a beautiful digital scrapbook of your love story.*
