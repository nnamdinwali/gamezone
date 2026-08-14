import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins.length > 0
    ? configuredOrigins
    : ["https://nnamdiwali.github.io", "http://localhost:5173"],
);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Non-browser requests have no Origin header and remain allowed.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed: ${origin}`));
    },
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authorized parties: the origins allowed to present a Clerk session token to
// this API. The site is deployed on GitHub Pages while the API lives on a
// different host, so the browser origin must be listed explicitly or Clerk
// rejects the bearer token and every authenticated route returns 401.
const authorizedParties = (
  process.env.CLERK_AUTHORIZED_PARTIES ??
  "https://nnamdiwali.github.io,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  clerkMiddleware((req) => ({
    // Pin the instance to the configured key. Deriving it from this API's own
    // hostname (manus.space) yields a different Clerk instance than the one the
    // frontend signs in against, so tokens never verify.
    publishableKey:
      process.env.CLERK_PUBLISHABLE_KEY ||
      publishableKeyFromHost(getClerkProxyHost(req) ?? "", undefined),
    secretKey: process.env.CLERK_SECRET_KEY,
    ...(authorizedParties.length ? { authorizedParties } : {}),
  })),
);

app.use("/api", router);

export default app;
