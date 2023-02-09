import PageSearch from "../components/PageSearch";
import DefaultLayout from "../layouts/Default";

interface DefaultLayoutProps {
  children?: React.ReactNode;
}

export default function HomePage(props: DefaultLayoutProps) {
  return (
    <>
      <DefaultLayout>
        <h1 className="title">Sentinels of the Multiverse</h1>

        <PageSearch />
      </DefaultLayout>
    </>
  );
}
