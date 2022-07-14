import { withSSRAuth } from "../utils/withSSRAuth";

export default function MetricsPage() {
  return (
    <div>
      <h1>metrics</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
