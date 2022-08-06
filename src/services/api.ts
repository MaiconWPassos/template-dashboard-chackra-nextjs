import axios, { AxiosError } from "axios";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./erros/AuthTokenError";

let isRefresing = false;
let failedRequestQueue = [];

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${
        cookies[process.env.NEXT_PUBLIC_SECRET_TOKEN_SESSION_KEY]
      }`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<any>) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);

          const {
            [`${process.env.NEXT_PUBLIC_SECRET_REFRESH_TOKEN_SESSION_KEY}`]:
              refreshToken,
          } = cookies;

          const originalConfig = error.config;

          if (!isRefresing) {
            isRefresing = true;

            api
              .post("/refreshToken", {
                refresh_token: refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(
                  ctx,
                  process.env.NEXT_PUBLIC_SECRET_TOKEN_SESSION_KEY,
                  token,
                  {
                    maxAge: 60 * 60 * 24 * 30, //30 day
                    path: "/",
                  }
                );

                if (response.data.refreshToken) {
                  setCookie(
                    ctx,
                    process.env.NEXT_PUBLIC_SECRET_REFRESH_TOKEN_SESSION_KEY,
                    response.data.refreshToken,
                    {
                      maxAge: 60 * 60 * 24 * 30, //30 day
                      path: "/",
                    }
                  );
                }

                api.defaults.headers["Authorization"] = "Bearer " + token;

                failedRequestQueue.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err));
                failedRequestQueue = [];
                if (process.browser) {
                  signOut();
                } else {
                  return Promise.reject(new AuthTokenError());
                }
              })
              .finally(() => {
                isRefresing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    }
  );
  return api;
}
