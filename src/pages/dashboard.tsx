import dynamic from "next/dynamic";

import { Box, Flex, SimpleGrid, Text, theme } from "@chakra-ui/react";
import { ApexOptions } from "apexcharts";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { setupApiClient } from "../services/api";
import { useCan } from "../hooks/useCan";
import { Layout } from "../components/Layout";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    foreColor: theme.colors.gray[500],
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },

  tooltip: {
    enabled: false,
  },
  xaxis: {
    type: "datetime",
    axisBorder: {
      color: theme.colors.gray[600],
    },
    axisTicks: {
      color: theme.colors.gray[600],
    },
    categories: [
      "2022-03-18T00:00:00.000Z",
      "2022-03-19T00:00:00.000Z",
      "2022-03-20T00:00:00.000Z",
      "2022-03-21T00:00:00.000Z",
      "2022-03-22T00:00:00.000Z",
      "2022-03-23T00:00:00.000Z",
      "2022-03-24T00:00:00.000Z",
    ],
  },
  fill: {
    opacity: 0.3,
    type: "gradient",
    gradient: {
      shade: "dark",
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
};

const series = [
  {
    name: "series1",
    data: [31, 12, 28, 150, 50, 65, 90],
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const useCanSeeMetrics = useCan({
    permissions: ["metrics.list"],
  });
  return (
    <Layout>
      <SimpleGrid
        flex="1"
        gap="4"
        minChildWidth="320px"
        alignItems="flex-start"
      >
        <Box p={["6", "8"]} bg="gray.800" borderRadius={8}>
          <Text fontSize="lg" mb="4">
            Inscritos da semana
          </Text>
          <Chart type="area" height={160} options={options} series={series} />
        </Box>

        <Box p="8" bg="gray.800" borderRadius={8}>
          <Text fontSize="lg" mb="4">
            Taxa de abertura
          </Text>
          <Chart type="area" height={160} options={options} series={series} />
        </Box>
      </SimpleGrid>
    </Layout>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);

  const response = await apiClient.get("/me");
  return {
    props: {},
  };
});
