import { Stack } from "@chakra-ui/react";
import {
  RiContactsBookLine,
  RiContactsLine,
  RiDashboardLine,
  RiGitMergeLine,
  RiInputMethodLine,
  RiUser2Line,
  RiUser3Line,
  RiUserStarLine,
} from "react-icons/ri";
import { Can } from "../Can";
import NavLink from "./NavLink";
import { NavSection } from "./NavSection";

export function SidebarNav() {
  return (
    <Stack spacing="12" align="flex-start">
      <NavSection title="Geral">
        <NavLink icon={RiDashboardLine} href="/dashboard">
          Dashboard
        </NavLink>
      </NavSection>

      <NavSection title="Autenticação">
        <Can permissions={["user.list"]}>
          <NavLink icon={RiUser3Line} href="/users">
            Usuários
          </NavLink>
        </Can>

        <Can permissions={["role.list"]}>
          <NavLink icon={RiUserStarLine} href="/roles">
            Perfis
          </NavLink>
        </Can>
      </NavSection>
    </Stack>
  );
}
