import app from './src/app';
import { connectDB } from './src/config/db';
import { env } from './src/config/env';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
  });
};

start();
