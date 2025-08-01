Workaround for package `@zodios/core` which is used by `@pythnetwork/hermes-client` in file `node_modules\@pythnetwork\hermes-client\lib\zodSchemas.d.ts` (line `import { type ZodiosOptions } from "@zodios/core";`).

Production build has issues with `require` and `exports`, so these are overwritten!
