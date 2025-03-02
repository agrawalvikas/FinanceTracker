import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import sheetsRouter from './routes/google-sheets';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session middleware with proper typing
const sessionMiddleware = session({
  secret: 'your-secret-key',
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

// Debug middleware with proper typing
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Incoming request session:', {
    url: req.url,
    hasSession: !!(req as any).session,
    sessionID: (req as any).sessionID
  });
  next();
});

app.use(sessionMiddleware);

// Post-session middleware with proper typing
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalEnd = res.end;
  const originalJson = res.json;

  // Override json method
  res.json = function(body) {
    console.log('Response session state:', {
      url: req.url,
      hasTokens: !!(req as any).session?.tokens,
      sessionID: (req as any).sessionID
    });
    return originalJson.call(this, body);
  };

  // Override end method with correct typing
  res.end = function(
    this: Response,
    chunk: any,
    encoding?: BufferEncoding,
    callback?: () => void
  ) {
    console.log('Response session state:', {
      url: req.url,
      hasTokens: !!(req as any).session?.tokens,
      sessionID: (req as any).sessionID
    });
    
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = null;
      encoding = undefined;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }

    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
  } as any; // Cast to any to avoid TypeScript overload issues

  next();
});

// Declare session types
declare module 'express-session' {
  interface SessionData {
    tokens: any;
  }
}

app.use('/api/sheets', sheetsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 