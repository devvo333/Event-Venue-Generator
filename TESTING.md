# Testing Strategy

This document outlines the testing approach for the Event Venue Generator application, including testing methods, tools, and best practices.

## Testing Levels

### Unit Testing

Unit tests focus on individual functions and components in isolation.

**Tools:**
- Jest
- React Testing Library
- Vitest (for Vite compatibility)

**What to test:**
- Pure utility functions
- Component rendering and basic interactions
- Hooks
- State transformations

**Example:**

```typescript
// Testing a utility function
import { calculateAspectRatio } from '@utils/imageUtils';

describe('calculateAspectRatio', () => {
  it('should calculate the correct aspect ratio', () => {
    expect(calculateAspectRatio(800, 600)).toBe(1.33);
    expect(calculateAspectRatio(1920, 1080)).toBe(1.78);
  });

  it('should handle zero height', () => {
    expect(calculateAspectRatio(800, 0)).toBe(0);
  });
});

// Testing a component
import { render, screen } from '@testing-library/react';
import VenueCard from '@components/venues/VenueCard';

const mockVenue = {
  id: '1',
  name: 'Test Venue',
  description: 'Test Description',
  cover_image: 'test.jpg',
  layouts_count: 2
};

describe('VenueCard', () => {
  it('renders venue information correctly', () => {
    render(<VenueCard venue={mockVenue} />);
    
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('2 layouts')).toBeInTheDocument();
  });
});
```

### Integration Testing

Integration tests verify that multiple components or systems work together correctly.

**Tools:**
- React Testing Library
- MSW (Mock Service Worker) for API mocking
- Cypress Component Testing

**What to test:**
- Component compositions
- Data flow between components
- Form submissions and validations
- Data fetching and rendering
- Router integration

**Example:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@auth/Login';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAuth hook
jest.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: jest.fn().mockResolvedValue({ success: true }),
    user: null
  })
}));

describe('Login Component', () => {
  it('submits login form with correct values', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that the form submission was successful
    await waitFor(() => {
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing

E2E tests verify the complete user flow from start to finish.

**Tools:**
- Cypress
- Playwright

**What to test:**
- Critical user journeys
- Authentication flows
- Layout creation and saving
- Asset manipulation on canvas
- Export functionality

**Example Cypress Test:**

```javascript
describe('Layout Creation Flow', () => {
  beforeEach(() => {
    // Set up auth state and login
    cy.login('test@example.com', 'password123');
  });

  it('should create a new layout', () => {
    // Navigate to editor
    cy.visit('/editor');
    
    // Upload a background image
    cy.get('input[type=file]').attachFile('test-venue.jpg');
    cy.get('[data-testid=upload-button]').click();
    cy.get('[data-testid=canvas]').should('be.visible');
    
    // Add an asset to the canvas
    cy.get('[data-testid=asset-item]').first().click();
    cy.get('[data-testid=canvas]').click(200, 200);
    
    // Save the layout
    cy.get('[data-testid=save-button]').click();
    cy.get('input[name=layout-name]').type('My Test Layout');
    cy.get('[data-testid=confirm-save]').click();
    
    // Verify the layout was saved
    cy.url().should('include', '/editor/');
    cy.get('[data-testid=save-success]').should('be.visible');
  });
});
```

## Visual Regression Testing

Ensure UI components maintain their appearance over time.

**Tools:**
- Storybook
- Chromatic
- Percy

**Example:**

Set up Storybook for key components and use Chromatic to capture and compare visual changes.

## Accessibility Testing

Verify the application is accessible to all users.

**Tools:**
- Axe
- Lighthouse
- Manual testing with screen readers

**Example:**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VenueCard from '@components/venues/VenueCard';

expect.extend(toHaveNoViolations);

describe('VenueCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <VenueCard 
        venue={{ 
          id: '1', 
          name: 'Test Venue', 
          description: 'Description', 
          cover_image: 'image.jpg',
          layouts_count: 3
        }} 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Performance Testing

Measure and optimize application performance.

**Tools:**
- Lighthouse
- Web Vitals
- React Profiler

**Metrics to measure:**
- Load time
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Canvas rendering performance

## Test Coverage Goals

- Unit tests: 80% code coverage
- Integration tests: Cover all main user flows
- E2E tests: Cover critical business journeys

## Testing Environment Setup

1. Install testing dependencies:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event jest-axe
```

2. Configure Vitest in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

3. Create a test setup file:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});
```

## Continuous Integration

Set up CI pipelines to run tests automatically:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

## Best Practices

1. **Write tests first** when possible (TDD approach)
2. **Name tests clearly** using descriptive language
3. **Keep tests independent** from each other
4. **Mock external dependencies** such as APIs
5. **Test behavior, not implementation** details
6. **Run tests locally** before pushing changes
7. **Maintain test coverage** when adding new features

## Test File Organization

Organize test files using a consistent pattern:

```
src/
├── components/
│   ├── VenueCard.tsx
│   └── __tests__/
│       └── VenueCard.test.tsx
├── utils/
│   ├── imageUtils.ts
│   └── __tests__/
│       └── imageUtils.test.ts
└── test/
    ├── setup.ts
    └── mocks/
        └── supabaseMock.ts
``` 