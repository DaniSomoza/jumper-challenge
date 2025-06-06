import { Route } from "../server/Server";
import authController from "../features/auth/authController";

export const NONCE_PATH = "/auth/nonce/:address";
export const SIGNIN_PATH = "/auth/session";

const getNonceRoute: Route = {
  url: NONCE_PATH,
  method: "GET",
  handler: authController.getNonce,
};

const signInRoute: Route = {
  url: SIGNIN_PATH,
  method: "POST",
  handler: authController.signIn,
};

const authRoutes = [getNonceRoute, signInRoute];

export default authRoutes;
