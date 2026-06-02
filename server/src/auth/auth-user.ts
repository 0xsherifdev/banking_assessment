/** The authenticated principal attached to each request by the JWT strategy. */
export interface AuthUser {
  id: number;
  email: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}
