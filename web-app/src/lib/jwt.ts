import { SignJWT } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: { sub: string; email: string; username: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getSecret());
}
