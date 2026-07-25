import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Main authenticated API
|--------------------------------------------------------------------------
|
| Dashboard, profile, admin, student, mentor jaise protected endpoints
| ke liye use hoga.
|
*/

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
|
| Registration, Cashfree order, payment verification aur receipt jaise
| public endpoints ke liye use karo.
|
| Is client par access-token refresh interceptor nahi lagega.
|
*/

export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Refresh API
|--------------------------------------------------------------------------
|
| Refresh request ko main api interceptors se alag rakha gaya hai,
| taaki infinite refresh loop na ho.
|
*/

const refreshApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,

  headers: {
    Accept: "application/json",
  },
});

interface RetryConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  success?: boolean;

  data?: {
    accessToken?: string;
    access_token?: string;
    user?: unknown;
  };

  accessToken?: string;
  access_token?: string;
  user?: unknown;
}

let refreshPromise: Promise<string> | null =
  null;

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
|
| Agar galti se public endpoint main `api` se call ho jaye, tab bhi
| refresh-token request nahi bheji jayegi.
|
*/

const PUBLIC_API_PATHS = [
  "/registration/verify",
  "/registration/domains",
  "/registration/details",
  "/registration/documents",
  "/registration/lock",
  "/registration/payment/order",
  "/registration/payment/verify",
  "/registration/payment/receipt",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const isPublicApiRequest = (
  requestUrl?: string,
): boolean => {
  if (!requestUrl) {
    return false;
  }

  return PUBLIC_API_PATHS.some(
    (path) =>
      requestUrl === path ||
      requestUrl.startsWith(
        `${path}/`,
      ) ||
      requestUrl.includes(path),
  );
};

const isRefreshRequest = (
  requestUrl?: string,
): boolean => {
  if (!requestUrl) {
    return false;
  }

  return requestUrl.includes(
    "/auth/refresh",
  );
};

const isLogoutRequest = (
  requestUrl?: string,
): boolean => {
  if (!requestUrl) {
    return false;
  }

  return requestUrl.includes(
    "/auth/logout",
  );
};

/*
|--------------------------------------------------------------------------
| Request new access token
|--------------------------------------------------------------------------
*/

const requestNewAccessToken =
  async (): Promise<string> => {
    const response =
      await refreshApi.post<RefreshResponse>(
        "/auth/refresh",
      );

    const responseBody =
      response.data;

    const responseData =
      responseBody?.data;

    const accessToken =
      responseData?.accessToken ||
      responseData?.access_token ||
      responseBody?.accessToken ||
      responseBody?.access_token;

    const user =
      responseData?.user ||
      responseBody?.user;

    if (!accessToken || !user) {
      throw new Error(
        "Refresh response is invalid",
      );
    }

    useAuthStore
      .getState()
      .setAuth(
        user as User,
        accessToken,
      );

    return accessToken;
  };
/*
|--------------------------------------------------------------------------
| Prevent duplicate refresh requests
|--------------------------------------------------------------------------
|
| Ek saath multiple protected APIs 401 return karein, to sirf ek refresh
| request jayegi. Baaki sab same promise wait karenge.
|
*/

export const refreshAccessToken =
  async (): Promise<string> => {
    if (!refreshPromise) {
      refreshPromise =
        requestNewAccessToken().finally(
          () => {
            refreshPromise = null;
          },
        );
    }

    return refreshPromise;
  };

/*
|--------------------------------------------------------------------------
| Authenticated request interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (
    config:
      InternalAxiosRequestConfig,
  ) => {
    const accessToken =
      useAuthStore
        .getState()
        .accessToken;

    if (
      accessToken &&
      !isPublicApiRequest(
        config.url,
      )
    ) {
      if (
        !config.headers
      ) {
        config.headers =
          new AxiosHeaders();
      }

      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    return config;
  },

  (error: unknown) =>
    Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| Authenticated response interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError,
  ) => {
    const originalRequest =
      error.config as
        | RetryConfig
        | undefined;

    if (
      error.response?.status !==
        401 ||
      !originalRequest
    ) {
      return Promise.reject(
        error,
      );
    }

    const requestUrl =
      originalRequest.url || "";

    /*
     * Public registration/payment endpoints ko refresh-token flow me
     * mat bhejo.
     */
    if (
      isPublicApiRequest(
        requestUrl,
      )
    ) {
      return Promise.reject(
        error,
      );
    }

    /*
     * Refresh endpoint ko dobara refresh nahi karna.
     */
    if (
      isRefreshRequest(
        requestUrl,
      )
    ) {
      useAuthStore
        .getState()
        .clearAuth();

      return Promise.reject(
        error,
      );
    }

    /*
     * Logout fail hone par refresh attempt nahi karna.
     */
    if (
      isLogoutRequest(
        requestUrl,
      )
    ) {
      useAuthStore
        .getState()
        .clearAuth();

      return Promise.reject(
        error,
      );
    }

    /*
     * Same request ko maximum ek baar retry karo.
     */
    if (
      originalRequest._retry
    ) {
      useAuthStore
        .getState()
        .clearAuth();

      return Promise.reject(
        error,
      );
    }

    originalRequest._retry =
      true;

    try {
      const accessToken =
        await refreshAccessToken();

      if (
        !originalRequest.headers
      ) {
        originalRequest.headers =
          new AxiosHeaders();
      }

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );

      return api(
        originalRequest,
      );
    } catch (
      refreshError
    ) {
      useAuthStore
        .getState()
        .clearAuth();

      return Promise.reject(
        refreshError,
      );
    }
  },
);