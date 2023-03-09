import { Helmet } from "react-helmet";

import Documentation from "../documentation.md";
import DefaultLayout from "../layouts/Default";

export default function DocumentationPage() {
  return (
    <>
      <Helmet>
        <title>Documentation</title>
      </Helmet>
      <DefaultLayout>
        <div className="content">
          <Documentation />
        </div>
      </DefaultLayout>
    </>
  );
}
