import type { Rol } from "./Rol";

export interface IUser {
  email: string;
  password: string;
  loggedIn: boolean;
  role: Rol;
}
