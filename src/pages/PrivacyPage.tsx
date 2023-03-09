import { Helmet } from "react-helmet";
import DefaultLayout from "../layouts/Default";
import Privacy from "../privacy.md";

interface PrivacyPageProps {
  children?: React.ReactNode;
}

export default function PrivacyPage(props: PrivacyPageProps) {
  return (
    <>
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>
      <DefaultLayout>
        <div className="content">
          <Privacy />
        </div>
      </DefaultLayout>
    </>
  );
}
