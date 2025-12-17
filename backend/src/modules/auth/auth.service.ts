import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env';
import type { Account, LoginRequest, RegisterRequest, Tokens } from './auth.types';

// In-memory storage
const accounts = new Map<string, Account>();
const accountByEmail = new Map<string, string>();
const refreshTokens = new Map<string, string>(); // refreshToken -> accountId
const passwords = new Map<string, string>(); // accountId -> hashed password (fake)

const generateTokens = (accountId: string): Tokens => {
  const accessToken = jwt.sign({ accountId }, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiry,
  });

  const refreshToken = jwt.sign({ accountId, type: 'refresh' }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiry,
  });

  return { accessToken, refreshToken };
};

export const authService = {
  register: async (data: RegisterRequest): Promise<{ account: Account; tokens: Tokens }> => {
    if (accountByEmail.has(data.email.toLowerCase())) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const accountId = `acc_${uuidv4().replace(/-/g, '')}`;
    const now = new Date().toISOString();

    const account: Account = {
      id: accountId,
      email: data.email,
      name: data.name,
      settings: {
        language: 'en',
        timezone: 'Asia/Karachi',
        notificationPreferences: {
          appointments: true,
          medications: true,
          reports: true,
          security: true,
        },
      },
      createdAt: now,
    };

    accounts.set(accountId, account);
    accountByEmail.set(data.email.toLowerCase(), accountId);
    passwords.set(accountId, data.password); // In production, hash this

    const tokens = generateTokens(accountId);
    refreshTokens.set(tokens.refreshToken, accountId);

    return { account, tokens };
  },

  login: async (data: LoginRequest): Promise<{ account: Account; tokens: Tokens }> => {
    const accountId = accountByEmail.get(data.email.toLowerCase());
    if (!accountId) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const account = accounts.get(accountId);
    if (!account) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const storedPassword = passwords.get(accountId);
    if (storedPassword !== data.password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const tokens = generateTokens(accountId);
    refreshTokens.set(tokens.refreshToken, accountId);

    return { account, tokens };
  },

  refreshToken: async (refreshToken: string): Promise<Tokens> => {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        accountId: string;
        type?: string;
      };

      if (decoded.type !== 'refresh') {
        throw new Error('INVALID_TOKEN');
      }

      if (!refreshTokens.has(refreshToken)) {
        throw new Error('INVALID_TOKEN');
      }

      const accountId = decoded.accountId;
      if (!accounts.has(accountId)) {
        throw new Error('ACCOUNT_NOT_FOUND');
      }

      // Remove old refresh token
      refreshTokens.delete(refreshToken);

      // Generate new tokens
      const newTokens = generateTokens(accountId);
      refreshTokens.set(newTokens.refreshToken, accountId);

      return newTokens;
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    refreshTokens.delete(refreshToken);
  },

  getAccountById: (accountId: string): Account | undefined => {
    return accounts.get(accountId);
  },
};

