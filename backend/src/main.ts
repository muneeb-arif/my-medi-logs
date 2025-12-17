import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`API base URL: ${config.apiBaseUrl}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

