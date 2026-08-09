"use strict";
export default `import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBIiwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJsb2dnZXIudHM/cmF3Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IFwiaW1wb3J0IHBpbm8gZnJvbSBcXFwicGlub1xcXCI7XFxuXFxuY29uc3QgaXNQcm9kdWN0aW9uID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFxcXCJwcm9kdWN0aW9uXFxcIjtcXG5cXG5leHBvcnQgY29uc3QgbG9nZ2VyID0gcGlubyh7XFxuICBsZXZlbDogcHJvY2Vzcy5lbnYuTE9HX0xFVkVMID8/IFxcXCJpbmZvXFxcIixcXG4gIHJlZGFjdDogW1xcbiAgICBcXFwicmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvblxcXCIsXFxuICAgIFxcXCJyZXEuaGVhZGVycy5jb29raWVcXFwiLFxcbiAgICBcXFwicmVzLmhlYWRlcnNbJ3NldC1jb29raWUnXVxcXCIsXFxuICBdLFxcbiAgLi4uKGlzUHJvZHVjdGlvblxcbiAgICA/IHt9XFxuICAgIDoge1xcbiAgICAgICAgdHJhbnNwb3J0OiB7XFxuICAgICAgICAgIHRhcmdldDogXFxcInBpbm8tcHJldHR5XFxcIixcXG4gICAgICAgICAgb3B0aW9uczogeyBjb2xvcml6ZTogdHJ1ZSB9LFxcbiAgICAgICAgfSxcXG4gICAgICB9KSxcXG59KTtcXG5cIiJdLCJmaWxlIjoiL2hvbWUvcnVubmVyL3dvcmtzcGFjZS9hcnRpZmFjdHMvYXBpLXNlcnZlci9zcmMvbGliL2xvZ2dlci50cyJ9