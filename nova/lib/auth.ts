import {
  getCookie,
  setCookie,
  removeCookie,
} from "./utils/cookies";

export const AUTH_COOKIE = {
  ACCESS_TOKEN: "appToken",
  REFRESH_TOKEN: "refreshToken",
  EXPIRES_AT: "expiresAt",
  ROLE: "userRole",
} as const;

export type UserRole = "admin" | "user";

export const auth = {
  setTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt?: string,
    role: UserRole = "user"
  ) {
    setCookie(AUTH_COOKIE.ACCESS_TOKEN, accessToken);
    setCookie(AUTH_COOKIE.REFRESH_TOKEN, refreshToken);
    setCookie(AUTH_COOKIE.ROLE, role);

    if (expiresAt) {
      setCookie(AUTH_COOKIE.EXPIRES_AT, expiresAt);
    }
  },

  getAccessToken() {
    return getCookie(AUTH_COOKIE.ACCESS_TOKEN);
  },

  getRefreshToken() {
    return getCookie(AUTH_COOKIE.REFRESH_TOKEN);
  },

  getExpiresAt() {
    return getCookie(AUTH_COOKIE.EXPIRES_AT);
  },

  getRole(): UserRole | undefined {
    const role = getCookie(AUTH_COOKIE.ROLE);
    return role === "admin" || role === "user" ? role : undefined;
  },

  isAdmin() {
    return this.isAuthenticated() && this.getRole() === "admin";
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  },

  logout() {
    removeCookie(AUTH_COOKIE.ACCESS_TOKEN);
    removeCookie(AUTH_COOKIE.REFRESH_TOKEN);
    removeCookie(AUTH_COOKIE.EXPIRES_AT);
    removeCookie(AUTH_COOKIE.ROLE);
  },
};