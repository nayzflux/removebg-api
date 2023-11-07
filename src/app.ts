import express from 'express';

import routes from './routes/routes';

const app = express();

const PORT = process.env.PORT;

import expressSession from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import  { PrismaClient } from '@prisma/client';

const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(
  expressSession({
    cookie: {
     maxAge: 30 * 24 * 60 * 60 * 1000
    },
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

app.use('/api/v1', routes);

app.listen(PORT, () => console.log(`Server listening on port :${PORT}`));

//TODO: Make test