import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';

describe('AuthContext Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts unauthenticated when localStorage is empty', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('sets user and token when logging in with valid credentials', async () => {
    const mockUser = {
      id: 'usr_123',
      name: 'Deepak Rai',
      email: 'deepak.test@example.com',
      role: 'landlord' as const,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(authApi, 'login').mockResolvedValueOnce({
      user: mockUser,
      accessToken: 'valid_jwt_token',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('deepak.test@example.com', 'Password123!');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('deepak.test@example.com');
    expect(localStorage.getItem('gharproof_token')).toBe('valid_jwt_token');
  });

  it('completely wipes user, token, and localStorage on logout', async () => {
    const mockUser = {
      id: 'usr_123',
      name: 'Deepak Rai',
      email: 'deepak.test@example.com',
      role: 'landlord' as const,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(authApi, 'login').mockResolvedValueOnce({
      user: mockUser,
      accessToken: 'valid_jwt_token',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('deepak.test@example.com', 'Password123!');
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('gharproof_token')).toBeNull();
    expect(localStorage.getItem('gharproof_user')).toBeNull();
  });

  it('remains unauthenticated after re-mounting (simulating page reload after logout)', async () => {
    const mockUser = {
      id: 'usr_123',
      name: 'Deepak Rai',
      email: 'deepak.test@example.com',
      role: 'landlord' as const,
      createdAt: new Date().toISOString(),
    };

    vi.spyOn(authApi, 'login').mockResolvedValueOnce({
      user: mockUser,
      accessToken: 'valid_jwt_token',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    // Session 1: Log in then log out
    const session1 = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await session1.result.current.login('deepak.test@example.com', 'Password123!');
    });
    act(() => {
      session1.result.current.logout();
    });

    // Session 2: Reload / remount AuthProvider
    const session2 = renderHook(() => useAuth(), { wrapper });
    expect(session2.result.current.isAuthenticated).toBe(false);
    expect(session2.result.current.user).toBeNull();
    expect(session2.result.current.token).toBeNull();
  });
});
