import { Flex } from "@chakra-ui/react";
import Head from "next/head";
import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Flex direction="column" h="100vh">
        <Header />
        <Flex w="100%" my="6" maxW={1480} mx="auto" px="6">
          <Sidebar />
          {children}
        </Flex>
      </Flex>
    </>
  );
}
