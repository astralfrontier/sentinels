import PageSearch from "../components/PageSearch";
import DefaultLayout from "../layouts/Default";

interface HomePageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: HomePageProps) {
  return (
    <>
      <DefaultLayout>
        <h1 className="title">Sentinels of the Multiverse</h1>

        <PageSearch />
      </DefaultLayout>
    </>
  );
}
