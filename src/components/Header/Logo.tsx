import { Text } from "@chakra-ui/react";

export function Logo() {
  return (
    <Text
      fontSize={["2xl", "3xl"]}
      fontWeight="bold"
      letterSpacing="title"
      w="64"
    >
      Logo
      <Text as="span" color="teal.500" ml="1">
        .
      </Text>
    </Text>
  );
}
