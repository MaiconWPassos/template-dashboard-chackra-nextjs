import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { Input } from "../../../components/form/Input";

import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { Layout } from "../../../components/Layout";

import { queryClient } from "../../../services/queryClient";
import { api } from "../../../services/apiClient";
import { withSSRAuth } from "../../../utils/withSSRAuth";
type CreateUserFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const createUserFormSchema = yup.object().shape({
  name: yup.string().required("Nome obrigatório"),
  email: yup.string().required("E-mail obrigatório").email("E-mail inválido"),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "No mínimo 6 caracteres"),
  password_confirmation: yup
    .string()
    .oneOf([null, yup.ref("password")], "As senhas precisam ser iguais"),
});

export default function UserCreate() {
  const router = useRouter();

  const createUser = useMutation(
    async (user: CreateUserFormData) => {
      const response = await api.post("/users", {
        user: {
          ...user,
          created_at: new Date(),
        },
      });

      return response.data.user;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
      },
    }
  );

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(createUserFormSchema),
  });

  const handleCreateUser: SubmitHandler<CreateUserFormData> = async (
    values
  ) => {
    await createUser.mutateAsync(values);

    router.push("/users");
  };

  return (
    <Layout>
      <Box
        flex="1"
        borderRadius={8}
        bg="gray.800"
        _light={{
          bg: "white",
          shadow: "lg",
        }}
        p={["6", "8"]}
        as="form"
        onSubmit={handleSubmit(handleCreateUser)}
      >
        <Heading size="lg" fontWeight="normal">
          Editar usuário
        </Heading>
        <Divider my="6" borderColor="gray.700" />

        <VStack spacing="8">
          <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
            <Input
              name="name"
              label="Nome Completo"
              error={formState.errors.name}
              {...register("name")}
            />
            <Input
              name="email"
              label="E-mail"
              type="email"
              error={formState.errors.email}
              {...register("email")}
            />
          </SimpleGrid>

          <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
            <Input
              name="password"
              label="Senha"
              type="password"
              error={formState.errors.password}
              {...register("password")}
            />
            <Input
              name="password_confirmation"
              label="Confirmação da senha"
              type="password"
              error={formState.errors.password_confirmation}
              {...register("password_confirmation")}
            />
          </SimpleGrid>
        </VStack>
        <Flex mt="8" justify="flex-end">
          <HStack spacing="4">
            <Link passHref href="/users">
              <Button as="a">Cancelar</Button>
            </Link>
            <Button
              colorScheme="blue"
              isLoading={formState.isSubmitting}
              type="submit"
            >
              Salvar
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Layout>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  };
});
