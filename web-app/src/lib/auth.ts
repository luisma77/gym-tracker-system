import { jwtVerify } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

export type AuthUser = {
  id: number;
  email: string;
  username: string;
};

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.username === "string"
    ) {
      return {
        id: Number(payload.sub),
        email: payload.email,
        username: payload.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}
