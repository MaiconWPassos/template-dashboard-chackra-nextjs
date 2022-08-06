import Router from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { api } from "../services/apiClient";
import { Entity } from "../models/Entity";

type User = {
  id: string;
  username: string;
  entity: Entity;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  username: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut(ctx = undefined) {
  destroyCookie(ctx, process.env.NEXT_PUBLIC_SECRET_TOKEN_SESSION_KEY);
  destroyCookie(ctx, process.env.NEXT_PUBLIC_SECRET_REFRESH_TOKEN_SESSION_KEY);

  authChannel.postMessage("signOut");

  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;

        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { [`${process.env.NEXT_PUBLIC_SECRET_TOKEN_SESSION_KEY}`]: token } =
      parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { permissions, roles, user } = response.data;

          setUser({ permissions, roles, ...user });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ username, password }: SignInCredentials) {
    try {
      const response = await api.post("login", {
        username,
        password,
      });

      const { permissions, roles, token, refreshToken, user } = response.data;

      setCookie(
        undefined,
        process.env.NEXT_PUBLIC_SECRET_TOKEN_SESSION_KEY,
        token,
        {
          maxAge: 60 * 60 * 24 * 30, //30 day
          path: "/",
        }
      );

      setCookie(
        undefined,
        process.env.NEXT_PUBLIC_SECRET_REFRESH_TOKEN_SESSION_KEY,
        refreshToken.id,
        {
          maxAge: 60 * 60 * 24 * 30, //30 day
          path: "/",
        }
      );

      setUser({
        permissions,
        roles,
        ...user,
      });

      api.defaults.headers["Authorization"] = "Bearer " + token;
      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const auth = useContext(AuthContext);

  return auth;
};
