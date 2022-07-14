import { useAuth } from "../contexts/AuthContext";
import { validateUserPermission } from "../utils/validateUserPermissions";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }
  const userhasValidPermissions = validateUserPermission({
    user,
    permissions,
    roles,
  });

  return userhasValidPermissions;
}
