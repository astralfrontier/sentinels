import { Helmet } from "react-helmet";
import PageSearch from "../components/PageSearch";
import DefaultLayout from "../layouts/Default";

interface SearchPageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: SearchPageProps) {
  return (
    <>
      <Helmet>
        <title>Deck Search</title>
      </Helmet>
      <DefaultLayout>
        <PageSearch />
      </DefaultLayout>
    </>
  );
}
