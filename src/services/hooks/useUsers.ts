import { useQuery, UseQueryOptions } from "react-query";
import { Entity } from "../../models/Entity";
import { api } from "../apiClient";

export type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  entity: Entity;
};

type GetUsersResponse = {
  totalCount: number;
  users: User[];
};

export async function getUsers(skip: number): Promise<GetUsersResponse> {
  const { data, headers } = await api.get("/users", {
    params: {
      skip: (skip - 1) * 10,
    },
  });
  const totalCount = Number(headers["x-total-count"]);

  const users = data.users.map((user: User) => {
    return {
      id: user.id,
      name: user.entity.name,
      username: user.username,
      email: user.entity.email,
      created_at: new Date(user.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      entity: user.entity,
    };
  });
  return { users, totalCount };
}

export const useUsers = (page: number, options: UseQueryOptions): any => {
  return useQuery(["users", page], async () => await getUsers(page), {
    staleTime: 1000 * 60 * 10,
    ...options,
  });
};
