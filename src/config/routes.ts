export const ROUTES = {
  public: [
    "/"
  ],
  auth: [
    "/signin",
    "/signup"
  ],
  protected: [
    "/dashboard"
  ],
} as const;

export type RouteType = 'public' | 'auth' | 'protected';
