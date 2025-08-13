// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "server",
      script: "server.js",
    },
    {
      name: "blur-worker",
      script: "lib/blur-worker.js",
    },
    {
      name: "face-id-queue",
      script: "lib/face-Id-queue.js",
    },
    {
      name: "album-worker",
      script: "lib/album-worker.js",
    },
    {
      name: "upload-worker",
      script: "lib/upload-worker.js",
    },
  ],
};
