import jsonwebtoken, { JwtPayload, SignOptions } from "jsonwebtoken";

import { JWT_SECRET } from "../constants";

export function createJWT(payload: Record<string, string>, expiresIn: string) {
  return jsonwebtoken.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
}

export function verifyJWT<T extends JwtPayload>(jwtToken: string): T {
  const payload = jsonwebtoken.verify(jwtToken, JWT_SECRET);

  return payload as T;
}
