export enum USER_ROLE {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'user',
  API_USER = 'api-admin',
}

export const ALLOWED_USER_ROLE = [
  USER_ROLE.USER,
  USER_ROLE.SUPER_ADMIN,
  USER_ROLE.ADMIN,
  USER_ROLE.API_USER,
];
