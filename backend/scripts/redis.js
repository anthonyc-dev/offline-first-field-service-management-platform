// redis.js
const { exec } = require("child_process");

// Configuration
const CONTAINER_NAME = "backend-redis-1";
const REDIS_PASSWORD = "anthony";

// Get command from args or default to KEYS *
const REDIS_CMD = process.argv.slice(2).join(" ") || "KEYS *";

// Build Docker exec command
const dockerCommand = `docker exec -i ${CONTAINER_NAME} redis-cli -a ${REDIS_PASSWORD} ${REDIS_CMD}`;

console.log("Running command:", dockerCommand);

exec(dockerCommand, (error, stdout, stderr) => {
  if (error) {
    console.error("Error executing command:", error.message);
    return;
  }
  if (stderr) {
    console.error("Redis error:", stderr);
    return;
  }
  console.log(stdout);
});
