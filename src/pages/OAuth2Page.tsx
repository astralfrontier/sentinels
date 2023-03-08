import { useLocation } from "react-router-dom";

import DefaultLayout from "../layouts/Default";

// http://localhost:8888/oauth2/notion?code=0373b0b5-7451-4c3d-87ef-20346d156283&state=

interface OAuth2PageProps {
  children?: React.ReactNode;
}

export default function OAuth2Page(_props: OAuth2PageProps) {
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery()

  const code = query.get("code")

  return (
    <>
      <DefaultLayout>
        {code}
      </DefaultLayout>
    </>
  );
}
