# Contributing to Dayli

Thank you for your interest in contributing to Dayli! This guide will help you get started with contributing to our shared journal application for couples.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Respect privacy and security considerations
- Keep discussions relevant to the project

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git
- Firebase account (for testing)
- Basic knowledge of React, TypeScript, and Firebase

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/dayli.git
   cd dayli
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/add-memory-tags` - New features
- `fix/journal-date-bug` - Bug fixes
- `docs/update-api-guide` - Documentation updates
- `refactor/auth-service` - Code refactoring
- `security/fix-rules` - Security improvements

### Commit Messages

Follow conventional commit format:
```
type(scope): brief description

Longer description if needed

Fixes #123
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding tests
- `security` - Security fixes
- `perf` - Performance improvements

Examples:
```
feat(journal): add mood tracking with emoji picker

fix(auth): resolve login redirect loop issue

docs(api): update authentication endpoints documentation

security(rules): enhance firestore security rules validation
```

## Project Structure

### Key Directories

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (shadcn/ui)
│   └── layout/        # Layout components
├── pages/             # Main application pages
├── services/          # API and external service integrations
├── hooks/             # Custom React hooks
├── lib/               # Configuration and utilities
├── contexts/          # React contexts
└── utils/             # Helper functions

server/                # Server-side API endpoints
docs/                  # Documentation
```

### Component Guidelines

1. **File Naming**
   - Use PascalCase for components: `MemoryCard.tsx`
   - Use camelCase for utilities: `dateUtils.ts`
   - Use kebab-case for CSS files: `memory-card.css`

2. **Component Structure**
   ```typescript
   interface ComponentProps {
     // Define prop types
   }

   export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
     // Component logic
     return (
       <div>
         {/* Component JSX */}
       </div>
     );
   };
   ```

3. **Export Pattern**
   ```typescript
   // Named export for the component
   export const ComponentName = () => { /* ... */ };

   // Default export if it's the main component of the file
   export default ComponentName;
   ```

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Avoid `any` type - use specific types or `unknown`
- Use type guards for runtime type checking

### React

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for performance
- Use React Query for data fetching

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Create reusable component variants
- Maintain responsive design principles

### Security

- Never hardcode secrets or API keys
- Validate all user inputs
- Follow Firebase security best practices
- Implement proper error handling without exposing sensitive information

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run security tests
./security-test.sh
```

### Writing Tests

1. **Unit Tests**
   ```typescript
   // utils/dateUtils.test.ts
   import { formatRelationshipDuration } from './dateUtils';

   describe('formatRelationshipDuration', () => {
     it('should format duration correctly', () => {
       const start = new Date('2023-01-01');
       const end = new Date('2024-02-15');
       expect(formatRelationshipDuration(start, end)).toBe('01:01:14');
     });
   });
   ```

2. **Component Tests**
   ```typescript
   // components/JournalCard.test.tsx
   import { render, screen } from '@testing-library/react';
   import { JournalCard } from './JournalCard';

   describe('JournalCard', () => {
     it('should display journal entry content', () => {
       const entry = { content: 'Test entry', mood: 'happy' };
       render(<JournalCard entry={entry} />);
       expect(screen.getByText('Test entry')).toBeInTheDocument();
     });
   });
   ```

3. **Integration Tests**
   ```typescript
   // services/journalService.test.ts
   import { saveJournalEntry, getJournalEntries } from './journalService';

   describe('journalService', () => {
     it('should save and retrieve journal entries', async () => {
       const entry = { content: 'Test', mood: 'happy', date: new Date() };
       await saveJournalEntry('user123', entry);
       const entries = await getJournalEntries('user123');
       expect(entries).toContain(expect.objectContaining(entry));
     });
   });
   ```

## Features to Contribute

### High Priority
- [ ] Enhanced mood tracking with detailed analytics
- [ ] Memory search and filtering capabilities
- [ ] Relationship milestone templates
- [ ] Data export functionality
- [ ] Mobile app companion

### Medium Priority
- [ ] Theme customization options
- [ ] Advanced privacy controls
- [ ] Integration with calendar apps
- [ ] Backup and sync improvements
- [ ] Performance optimizations

### Low Priority
- [ ] Additional file format support
- [ ] Social sharing features (with privacy controls)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Accessibility improvements

## Security Considerations

### When Contributing

1. **Never commit sensitive data**
   - API keys, passwords, or tokens
   - Real user data or personal information
   - Development database credentials

2. **Follow security practices**
   - Validate all inputs on both client and server
   - Use parameterized queries
   - Implement proper authentication checks
   - Follow the principle of least privilege

3. **Test security implications**
   - Run security tests before submitting
   - Consider potential attack vectors
   - Review Firebase security rules changes carefully

## Pull Request Process

### Before Submitting

1. **Code Quality**
   ```bash
   # Run linting
   npm run lint

   # Fix auto-fixable issues
   npm run lint:fix

   # Check TypeScript
   npm run type-check

   # Run tests
   npm test
   ```

2. **Security Check**
   ```bash
   # Run security tests
   ./security-test.sh

   # Check for secrets in code
   git secrets --scan
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security tests pass
- [ ] Manual testing completed

## Security Checklist
- [ ] No sensitive data in code
- [ ] Input validation implemented
- [ ] Authentication checks in place
- [ ] Security tests updated

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Fixes #(issue number)
```

### Review Process

1. **Automated Checks**
   - All tests must pass
   - Code must pass linting
   - Security scans must be clean

2. **Manual Review**
   - Code quality and style
   - Security implications
   - Performance impact
   - Documentation updates

3. **Approval**
   - At least one maintainer approval required
   - Security-related changes require additional review

## Documentation

### When to Update Documentation

- Adding new features or APIs
- Changing existing behavior
- Security-related changes
- Setup or deployment changes

### Documentation Standards

- Use clear, concise language
- Include code examples
- Update relevant API documentation
- Add screenshots for UI changes

## Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code-specific discussions

### Getting Help

1. **Check existing documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Ask questions** in GitHub Discussions
4. **Join development discussions** in pull requests

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special recognition for security improvements

Thank you for contributing to Dayli and helping couples create beautiful memories together! 💕
