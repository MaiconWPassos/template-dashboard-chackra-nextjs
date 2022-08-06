import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";

import { RiAddLine, RiPencilLine } from "react-icons/ri";
import { Layout } from "../../components/Layout";
import Pagination from "../../components/Pagination";
import { api } from "../../services/apiClient";

import { User, useUsers } from "../../services/hooks/useUsers";
import { queryClient } from "../../services/queryClient";
import { withSSRAuth } from "../../utils/withSSRAuth";

export default function UserList({ users }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isFetching, error } = useUsers(currentPage, {
    initialData: users,
  });

  const isWideVersion = useBreakpointValue({
    base: false,
    lg: true,
  });

  async function handlePrefetchUser(userId: string) {
    await queryClient.prefetchQuery(
      ["user", userId],
      async () => {
        const { data } = await api.get(`/users/${userId}`);

        return data;
      },
      {
        staleTime: 1000 * 60 * 10,
      }
    );
  }

  return (
    <Layout>
      <Box
        flex="1"
        borderRadius={8}
        bg="gray.800"
        p="8"
        _light={{
          bg: "white",
          shadow: "lg",
        }}
      >
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Usuários
            {!isLoading && isFetching && (
              <Spinner size="sm" color="gray.500" ml="4" />
            )}
          </Heading>

          <NextLink href="/users/create" passHref>
            <Button
              as="a"
              size="sm"
              fontSize="sm"
              colorScheme="blue"
              leftIcon={<Icon as={RiAddLine} fontSize="20" />}
            >
              Criar novo
            </Button>
          </NextLink>
        </Flex>

        {isLoading ? (
          <Flex justify="center">
            <Spinner />
          </Flex>
        ) : error ? (
          <Flex justify="center">
            <Text>Falha ao obter dados dos usuários</Text>
          </Flex>
        ) : (
          <>
            <Table colorScheme="whiredpha" overflowX="auto">
              <Thead>
                <Tr>
                  <Th>Usuário</Th>

                  {isWideVersion && <Th>Data de Cadastro</Th>}
                  <Th w="8" />
                </Tr>
              </Thead>
              <Tbody>
                {data.users.map((user: User) => {
                  return (
                    <Tr key={user.id}>
                      <Td>
                        <Box>
                          <Link
                            color="blue.400"
                            onMouseEnter={() => handlePrefetchUser(user.id)}
                          >
                            <Text fontWeight="bold">{user.username}</Text>
                          </Link>
                          <Text fontSize="small" color="gray.300">
                            {user.email}
                          </Text>
                        </Box>
                      </Td>
                      {isWideVersion && <Td>{user.created_at}</Td>}

                      <Td>
                        {isWideVersion ? (
                          <Button
                            as="a"
                            size="sm"
                            fontSize="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                            href={`/users/editar/${user.id}`}
                          >
                            Editar
                          </Button>
                        ) : (
                          <IconButton
                            aria-label="Editar"
                            colorScheme="blue"
                            icon={<Icon as={RiPencilLine} />}
                          />
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Pagination
              totalCountOfRegisters={data.totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Box>
    </Layout>
  );
}

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  {
    permissions: ["user.list"],
    roles: [],
  }
);
