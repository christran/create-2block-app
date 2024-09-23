export interface RateLimitConfig {
  limit: number;
  window: string;
  path: string;
}

export const rateLimitConfig: Record<string, RateLimitConfig> = {
  // login: {
  //   limit: 1,
  //   window: "10 s",
  //   path: "/login",
  // },
  // magicLink: {
  //   limit: 1,
  //   window: "10 s",
  //   path: "/login/verify",
  // },
};

export type RateLimitKey = keyof typeof rateLimitConfig;