import { auth } from "@2block/auth";
import { User } from "@2block/db/schema";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({ 
    headers: headers() 
  });

  // Remove the password from the user object
  const user: Omit<User, "password"> | null = session?.user
    ? (({ password, ...rest }) => rest)(session.user as User)
    : null;

  return { 
    session, 
    user
  };
};
