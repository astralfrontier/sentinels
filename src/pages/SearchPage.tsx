import PageSearch from "../components/PageSearch";
import DefaultLayout from "../layouts/Default";

interface SearchPageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: SearchPageProps) {
  return (
    <>
      <DefaultLayout>
        <PageSearch />
      </DefaultLayout>
    </>
  );
}
