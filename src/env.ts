import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

type RuntimeEnv = Record<string, string | boolean | number | undefined>;

export const createServerEnv = (runtimeEnv: RuntimeEnv) =>
  createEnv({
    server: {
      RESEND_API_KEY: z.string().min(1),
    },
    runtimeEnvStrict: {
      RESEND_API_KEY: runtimeEnv.RESEND_API_KEY,
    },
    emptyStringAsUndefined: true,
  });
