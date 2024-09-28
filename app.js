/* eslint-disable no-console */
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import cors from 'cors';
import routes from './routes/web.js';
import swaggerJSDocOptions from './swaggerJSDocOptions.js';

dotenv.config({ path: path.resolve('.', '.env') });
const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Database connection
const mongoDB = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
mongoose.set('useCreateIndex', true);
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('Database %s connected successfully', mongoDB);
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database.');
});

// Swagger UI
const swaggerSpec = swaggerJSDoc(swaggerJSDocOptions);
const swaggerUiOptions = {
  swaggerOptions: {
    basicAuth: {
      name: 'Authorization',
      schema: {
        type: 'basic',
        in: 'header',
      },
      value: 'Basic <user:password>',
    },
  },
};
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

app.use('/', routes);
app.listen(process.env.APP_PORT, () => {
  console.log(
    `Application running at http://localhost:${process.env.APP_PORT}`,
  );
});
