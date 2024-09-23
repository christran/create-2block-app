export interface RateLimitConfig {
  limit: number;
  window: string;
  path: string;
}

export const rateLimitConfig: Record<string, RateLimitConfig> = {
  login: {
    limit: 5,
    window: "10s",
    path: "/login",
  },
  // cleanup: {
  //   limit: 10,
  //   window: "10s",
  //   path: "/api/upload/cleanup",
  // },
  // magicLink: {
  //   limit: 10,
  //   window: "10s",
  //   path: "/login/verify",
  // },
};

export type RateLimitKey = keyof typeof rateLimitConfig;