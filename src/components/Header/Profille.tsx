import {
  Avatar,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
  Icon,
} from "@chakra-ui/react";
import { RiLogoutBoxRLine, RiMoonLine, RiSunLine } from "react-icons/ri";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileProps {
  showProfileData: boolean;
}

export function Profile({ showProfileData = true }: ProfileProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  return (
    <Menu isLazy>
      <MenuButton>
        <Flex align="center">
          {showProfileData && (
            <Box mr="4" textAlign="right">
              <Text>{user?.entity.name}</Text>

              <Text color="gray.300" fontSize="small">
                {user?.username}
              </Text>
            </Box>
          )}
          <Avatar
            size="md"
            name="Maicon W. Passos"
            src="https://github.com/maiconwpassos.png"
          />
        </Flex>
      </MenuButton>
      <MenuList
        bg="gray.800"
        _light={{
          bg: "white",
        }}
      >
        <MenuItem onClick={toggleColorMode}>
          <Icon as={colorMode === "light" ? RiSunLine : RiMoonLine} mr="2" />{" "}
          Modo {colorMode === "light" ? "Light" : "Dark"}
        </MenuItem>
        <MenuItem onClick={signOut}>
          <Icon as={RiLogoutBoxRLine} mr="2" /> Sair
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
