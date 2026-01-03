import { createApp } from "./app.js";
import { config } from "./config/env.js";

async function startServer() {
  try {
    // Create Express app
    const app = createApp();

    // Start server
    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
