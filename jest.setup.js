import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        getPublicUrl: jest.fn(),
        createSignedUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
  }),
})); 