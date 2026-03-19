import { SignJWT, jwtVerify } from 'jose';

export type SessionPayload = {
  userId: string;
  role: string;
  name: string;
  email: string;
  expiresAt: Date;
};

const secretKey = process.env.SESSION_SECRET || 'fallback_secret_key';
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
