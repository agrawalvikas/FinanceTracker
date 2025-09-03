import express from 'express';
import session from 'express-session';
import cors from 'cors';
import sheetsRouter from './routes/google-sheets';

const app = express();
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is not defined in the environment variables.');
}

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session middleware with proper typing
const sessionMiddleware = session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  },
  name: 'google.session'
});

app.use(sessionMiddleware);

import { Credentials } from 'google-auth-library';

// Declare session types
declare module 'express-session' {
  interface SessionData {
    tokens: Credentials;
  }
}

app.use('/api/sheets', sheetsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 