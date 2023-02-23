import PageSearch from "../components/PageSearch";
import DefaultLayout from "../layouts/Default";

interface HomePageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: HomePageProps) {
  return (
    <>
      <DefaultLayout>
        <PageSearch />
      </DefaultLayout>
    </>
  );
}
