# Code Style Standards

This file defines the coding standards for all Claude Productivity Suite projects.

## General Principles

1. **Clarity over Cleverness**: Write code that is easy to understand
2. **Consistency**: Follow established patterns within the codebase
3. **Testability**: Write code that is easy to test
4. **Documentation**: Document complex logic and public APIs

## JavaScript/TypeScript

### Naming Conventions

```typescript
// Classes: PascalCase
class UserService {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IUserData {}

// Functions/Methods: camelCase
function getUserById() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Variables: camelCase
const userEmail = 'user@example.com';

// Private members: underscore prefix
private _internalState = {};

// React Components: PascalCase
const UserProfile = () => {};

// React Hooks: use prefix
const useAuth = () => {};
```

### File Naming

```
// React Components
UserProfile.tsx
UserProfile.test.tsx
UserProfile.module.css

// Utilities
formatDate.ts
formatDate.test.ts

// Types/Interfaces
types/user.ts
interfaces/api.ts

// Constants
constants/apiEndpoints.ts
```

### Code Organization

```typescript
// 1. Imports (grouped and ordered)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { Button, Card } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate } from '@/utils/date';

import type { User } from '@/types';

// 2. Type definitions
interface Props {
  userId: string;
}

// 3. Constants
const REFRESH_INTERVAL = 30000;

// 4. Component/Function
export function UserProfile({ userId }: Props) {
  // hooks first
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // effects
  useEffect(() => {
    // ...
  }, [userId]);

  // handlers
  const handleUpdate = async () => {
    // ...
  };

  // render
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}
```

## CSS/Styling

### Tailwind CSS Guidelines

```jsx
// Prefer component classes over utility soup
<div className="card-primary"> // defined in @layer components

// Group related utilities
<div className="
  flex items-center justify-between
  p-4 mb-2
  bg-white dark:bg-gray-800
  rounded-lg shadow-sm
">

// Extract complex combinations
const buttonStyles = clsx(
  'px-4 py-2 rounded-md font-medium',
  'bg-blue-500 hover:bg-blue-600',
  'text-white',
  'transition-colors duration-200'
);
```

## Git Commit Messages

```
feat: add user authentication
fix: resolve memory leak in data fetcher
docs: update API documentation
style: format code with prettier
refactor: extract validation logic
test: add unit tests for auth service
chore: update dependencies
```

## Error Handling

```typescript
// Always handle errors explicitly
try {
  const result = await api.fetchUser(id);
  return result;
} catch (error) {
  // Log with context
  console.error('Failed to fetch user', { userId: id, error });
  
  // Throw meaningful errors
  throw new Error(`Unable to fetch user ${id}: ${error.message}`);
}

// Use error boundaries in React
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

## Testing Standards

```typescript
// Descriptive test names
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user data when user exists', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, name: 'John' };
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user not found', async () => {
      // ...
    });
  });
});
```

## Performance Guidelines

1. **Lazy Loading**: Use dynamic imports for large components
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **Image Optimization**: Use next/image or optimized formats
4. **Bundle Size**: Monitor and optimize bundle size regularly

## Accessibility Standards

```jsx
// Always include semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

// Provide alternative text
<img src="logo.png" alt="Company logo" />

// Use ARIA labels when needed
<button aria-label="Close dialog" onClick={onClose}>
  <CloseIcon />
</button>

// Ensure keyboard navigation
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
```

## Security Best Practices

1. **Input Validation**: Always validate user input
2. **SQL Injection**: Use parameterized queries
3. **XSS Prevention**: Sanitize user-generated content
4. **Environment Variables**: Never commit secrets
5. **Dependencies**: Keep dependencies updated
6. **CORS**: Configure appropriately for production

## Override Instructions

Individual projects can extend or override these standards by creating:
`.claude-suite/project/code-style.md`
