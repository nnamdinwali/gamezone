"use strict";
export default `import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

// Our exports make assumptions about the title of the API being "Api" (i.e. generated output is \`api.ts\`).
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ['boolean', 'number', 'string'],
            param: ['boolean', 'number', 'string'],
            body: ['bigint', 'date'],
            response: ['bigint', 'date'],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
`;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ydmFsLmNvbmZpZy50cz9yYXciXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJpbXBvcnQgeyBkZWZpbmVDb25maWcsIElucHV0VHJhbnNmb3JtZXJGbiB9IGZyb20gXFxcIm9ydmFsXFxcIjtcXG5pbXBvcnQgcGF0aCBmcm9tIFxcXCJwYXRoXFxcIjtcXG5cXG5jb25zdCByb290ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXFxcIi4uXFxcIiwgXFxcIi4uXFxcIik7XFxuY29uc3QgYXBpQ2xpZW50UmVhY3RTcmMgPSBwYXRoLnJlc29sdmUocm9vdCwgXFxcImxpYlxcXCIsIFxcXCJhcGktY2xpZW50LXJlYWN0XFxcIiwgXFxcInNyY1xcXCIpO1xcbmNvbnN0IGFwaVpvZFNyYyA9IHBhdGgucmVzb2x2ZShyb290LCBcXFwibGliXFxcIiwgXFxcImFwaS16b2RcXFwiLCBcXFwic3JjXFxcIik7XFxuXFxuLy8gT3VyIGV4cG9ydHMgbWFrZSBhc3N1bXB0aW9ucyBhYm91dCB0aGUgdGl0bGUgb2YgdGhlIEFQSSBiZWluZyBcXFwiQXBpXFxcIiAoaS5lLiBnZW5lcmF0ZWQgb3V0cHV0IGlzIGBhcGkudHNgKS5cXG5jb25zdCB0aXRsZVRyYW5zZm9ybWVyOiBJbnB1dFRyYW5zZm9ybWVyRm4gPSAoY29uZmlnKSA9PiB7XFxuICBjb25maWcuaW5mbyA/Pz0ge307XFxuICBjb25maWcuaW5mby50aXRsZSA9IFxcXCJBcGlcXFwiO1xcblxcbiAgcmV0dXJuIGNvbmZpZztcXG59O1xcblxcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XFxuICBcXFwiYXBpLWNsaWVudC1yZWFjdFxcXCI6IHtcXG4gICAgaW5wdXQ6IHtcXG4gICAgICB0YXJnZXQ6IFxcXCIuL29wZW5hcGkueWFtbFxcXCIsXFxuICAgICAgb3ZlcnJpZGU6IHtcXG4gICAgICAgIHRyYW5zZm9ybWVyOiB0aXRsZVRyYW5zZm9ybWVyLFxcbiAgICAgIH0sXFxuICAgIH0sXFxuICAgIG91dHB1dDoge1xcbiAgICAgIHdvcmtzcGFjZTogYXBpQ2xpZW50UmVhY3RTcmMsXFxuICAgICAgdGFyZ2V0OiBcXFwiZ2VuZXJhdGVkXFxcIixcXG4gICAgICBjbGllbnQ6IFxcXCJyZWFjdC1xdWVyeVxcXCIsXFxuICAgICAgbW9kZTogXFxcInNwbGl0XFxcIixcXG4gICAgICBiYXNlVXJsOiBcXFwiL2FwaVxcXCIsXFxuICAgICAgY2xlYW46IHRydWUsXFxuICAgICAgcHJldHRpZXI6IHRydWUsXFxuICAgICAgb3ZlcnJpZGU6IHtcXG4gICAgICAgIGZldGNoOiB7XFxuICAgICAgICAgIGluY2x1ZGVIdHRwUmVzcG9uc2VSZXR1cm5UeXBlOiBmYWxzZSxcXG4gICAgICAgIH0sXFxuICAgICAgICBtdXRhdG9yOiB7XFxuICAgICAgICAgIHBhdGg6IHBhdGgucmVzb2x2ZShhcGlDbGllbnRSZWFjdFNyYywgXFxcImN1c3RvbS1mZXRjaC50c1xcXCIpLFxcbiAgICAgICAgICBuYW1lOiBcXFwiY3VzdG9tRmV0Y2hcXFwiLFxcbiAgICAgICAgfSxcXG4gICAgICB9LFxcbiAgICB9LFxcbiAgfSxcXG4gIHpvZDoge1xcbiAgICBpbnB1dDoge1xcbiAgICAgIHRhcmdldDogXFxcIi4vb3BlbmFwaS55YW1sXFxcIixcXG4gICAgICBvdmVycmlkZToge1xcbiAgICAgICAgdHJhbnNmb3JtZXI6IHRpdGxlVHJhbnNmb3JtZXIsXFxuICAgICAgfSxcXG4gICAgfSxcXG4gICAgb3V0cHV0OiB7XFxuICAgICAgd29ya3NwYWNlOiBhcGlab2RTcmMsXFxuICAgICAgY2xpZW50OiBcXFwiem9kXFxcIixcXG4gICAgICB0YXJnZXQ6IFxcXCJnZW5lcmF0ZWRcXFwiLFxcbiAgICAgIHNjaGVtYXM6IHsgcGF0aDogXFxcImdlbmVyYXRlZC90eXBlc1xcXCIsIHR5cGU6IFxcXCJ0eXBlc2NyaXB0XFxcIiB9LFxcbiAgICAgIG1vZGU6IFxcXCJzcGxpdFxcXCIsXFxuICAgICAgY2xlYW46IHRydWUsXFxuICAgICAgcHJldHRpZXI6IHRydWUsXFxuICAgICAgb3ZlcnJpZGU6IHtcXG4gICAgICAgIHpvZDoge1xcbiAgICAgICAgICBjb2VyY2U6IHtcXG4gICAgICAgICAgICBxdWVyeTogWydib29sZWFuJywgJ251bWJlcicsICdzdHJpbmcnXSxcXG4gICAgICAgICAgICBwYXJhbTogWydib29sZWFuJywgJ251bWJlcicsICdzdHJpbmcnXSxcXG4gICAgICAgICAgICBib2R5OiBbJ2JpZ2ludCcsICdkYXRlJ10sXFxuICAgICAgICAgICAgcmVzcG9uc2U6IFsnYmlnaW50JywgJ2RhdGUnXSxcXG4gICAgICAgICAgfSxcXG4gICAgICAgIH0sXFxuICAgICAgICB1c2VEYXRlczogdHJ1ZSxcXG4gICAgICAgIHVzZUJpZ0ludDogdHJ1ZSxcXG4gICAgICB9LFxcbiAgICB9LFxcbiAgfSxcXG59KTtcXG5cIiJdLCJtYXBwaW5ncyI6IjtBQUFBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7IiwibmFtZXMiOltdfQ==