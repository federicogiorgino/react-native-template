import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { config } from "./config";

/**
 * Better Auth client for the API. The session cookie is kept in the device keychain
 * (expo-secure-store). The scheme comes from `app.identity.json` and must also be listed in
 * the server's TRUSTED_ORIGINS.
 */
export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    expoClient({
      scheme: config.scheme,
      storagePrefix: config.slug,
      storage: SecureStore,
    }),
  ],
});
