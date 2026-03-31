import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import { getEnv } from "@/lib/db/client";
import { getPasskeyByCredentialId, listUserPasskeys } from "@/lib/db/repositories/passkeys";

type RegistrationResponsePayload = Parameters<typeof verifyRegistrationResponse>[0]["response"];
type AuthenticationResponsePayload = Parameters<typeof verifyAuthenticationResponse>[0]["response"];

function toBase64Url(value: ArrayBuffer | Uint8Array | string) {
  if (typeof value === "string") return value;
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  return Buffer.from(bytes).toString("base64url");
}

async function getRpConfig(request: Request) {
  const env = await getEnv();
  const requestUrl = new URL(request.url);
  const appUrl = new URL(env.APP_URL);

  return {
    rpName: env.APP_NAME,
    rpID: requestUrl.hostname,
    expectedOrigin: [...new Set([requestUrl.origin, appUrl.origin])],
    expectedRPID: [...new Set([requestUrl.hostname, appUrl.hostname])]
  };
}

export async function createPasskeyRegistrationOptions(
  request: Request,
  user: { id: string; email: string; displayName?: string | null }
) {
  const rp = await getRpConfig(request);
  const existingPasskeys = await listUserPasskeys(user.id);

  return generateRegistrationOptions({
    rpName: rp.rpName,
    rpID: rp.rpID,
    userID: Buffer.from(user.id, "utf8"),
    userName: user.email,
    userDisplayName: user.displayName ?? user.email,
    timeout: 60_000,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred"
    },
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as never
    }))
  });
}

export async function verifyPasskeyRegistration(
  request: Request,
  expectedChallenge: string,
  response: RegistrationResponsePayload
) {
  const rp = await getRpConfig(request);
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: rp.expectedOrigin,
    expectedRPID: rp.expectedRPID,
    requireUserVerification: false
  });

  if (!verification.verified || !verification.registrationInfo) {
    return { verified: false as const };
  }

  const { credential, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;

  return {
    verified: true as const,
    credentialId: toBase64Url(credential.id),
    publicKey: toBase64Url(credential.publicKey),
    counter: credential.counter,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    transports: response.response.transports ?? []
  };
}

export async function createPasskeyAuthenticationOptions(request: Request) {
  const rp = await getRpConfig(request);

  return generateAuthenticationOptions({
    rpID: rp.rpID,
    timeout: 60_000,
    userVerification: "preferred"
  });
}

export async function verifyPasskeyAuthentication(
  request: Request,
  expectedChallenge: string,
  response: AuthenticationResponsePayload
) {
  const storedPasskey = await getPasskeyByCredentialId(response.id);
  if (!storedPasskey) {
    return { verified: false as const };
  }

  const rp = await getRpConfig(request);
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: rp.expectedOrigin,
    expectedRPID: rp.expectedRPID,
    credential: {
      id: storedPasskey.credentialId,
      publicKey: Buffer.from(storedPasskey.publicKey, "base64url"),
      counter: storedPasskey.counter,
      transports: storedPasskey.transports as never
    },
    requireUserVerification: false
  });

  if (!verification.verified) {
    return { verified: false as const };
  }

  return {
    verified: true as const,
    userId: storedPasskey.userId,
    credentialId: storedPasskey.credentialId,
    newCounter: verification.authenticationInfo.newCounter
  };
}
