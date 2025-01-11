import { hash } from "bcrypt-ts";

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, 10).then((hashedPassword: string) => {
    return hashedPassword;
  });
}
