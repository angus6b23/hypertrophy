import { db } from "backend/db";
import { oidcSessions } from "backend/db/schema/oidc";
import * as oidc from "openid-client";
import { single } from "./db-helper";
import { eq } from "drizzle-orm";
import { oidcConfig } from "./constants";

/**
 * Generate a login URL from sessionID
 *
 * @param sessionId - Unique session Id provided by express.js
 * @returns Return url of the oidc login page
 *
 */
export const generateOIDCRedirectURL = async (sessionID: string) => {
  if (!oidcConfig) {
    throw new Error("OIDC not configured");
  }
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  await db.insert(oidcSessions).values({
    id: sessionID,
    verifier: codeVerifier,
    codeChallenge,
    state,
  });
  return oidc.buildAuthorizationUrl(oidcConfig, {
    scope: "openid,profile,email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    code_verifier: codeVerifier,
  });
};

export const verifyOIDC = async (sessionId: string, url: URL) => {
  try {
    if (!oidcConfig) {
      throw new Error("OIDC not configured");
    }
    const record = await db
      .select()
      .from(oidcSessions)
      .where(eq(oidcSessions.id, sessionId))
      .then(single);
    return await oidc.authorizationCodeGrant(oidcConfig, url, {
      pkceCodeVerifier: record.verifier,
      expectedState: record.state,
    });
  } catch (err) {
    return err as Error;
  }
};
