import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import decode from "jwt-decode";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/erros/AuthTokenError";
import { validateUserPermission } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions: string[];
  roles: string[];
};

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    const token = cookies[process.env.SECRET_TOKEN_SESSION_KEY];

    if (!cookies[process.env.SECRET_TOKEN_SESSION_KEY]) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token);

      const { permissions, roles } = options;
      const userhasValidPermissions = validateUserPermission({
        user,
        permissions,
        roles,
      });

      if (!userhasValidPermissions) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, process.env.SECRET_TOKEN_SESSION_KEY);
        destroyCookie(ctx, process.env.SECRET_REFRESH_TOKEN_SESSION_KEY);

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
