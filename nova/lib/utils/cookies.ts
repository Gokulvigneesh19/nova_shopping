// @ts-expect-error - js-cookie has no local type declarations in this setup
import Cookies from "js-cookie";

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  Cookies.set(name, value, {
    expires: options.expires ?? 7,
    path: options.path ?? "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: options.sameSite ?? "lax",
  });
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name, {
    path: "/",
  });
};

export const clearCookies = (...names: string[]) => {
  names.forEach((name) =>
    Cookies.remove(name, {
      path: "/",
    })
  );
};
