import type { SiweMessage } from "siwe";
import { type AxiosResponse } from "axios";

import Api from "./Api";

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN;

type nonceResponse = {
  address: string;
  nonce: string;
  nonceSigned: string;
};

export async function getNonce(
  address: string
): Promise<AxiosResponse<nonceResponse>> {
  const getNonceEnpoint = `${backendOrigin}/auth/nonce/${address}`;

  return await Api.get<nonceResponse>(getNonceEnpoint);
}

export type signInBodyData = {
  siweMessageData: Partial<SiweMessage>;
  message: string;
  signature: string;
  nonceSigned: string;
};

type sessionResponse = {
  sessionToken: string;
};

export async function signIn({
  siweMessageData,
  message,
  signature,
  nonceSigned,
}: signInBodyData): Promise<AxiosResponse<sessionResponse>> {
  const signInEndpoint = `${backendOrigin}/auth/session`;

  const payload = { siweMessageData, message, signature, nonceSigned };

  return await Api.post<sessionResponse, typeof payload>(
    signInEndpoint,
    payload
  );
}

const authEndpoints = {
  getNonce,
  signIn,
};

export default authEndpoints;
