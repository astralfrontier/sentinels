import { Helmet } from "react-helmet";
import DefaultLayout from "../layouts/Default";
import Terms from "../terms.md";

interface TermsOfUseProps {
  children?: React.ReactNode;
}

export default function TermsOfUsePage(props: TermsOfUseProps) {
  return (
    <>
      <Helmet>
        <title>Terms of Use</title>
      </Helmet>
      <DefaultLayout>
        <div className="content">
          <Terms />
        </div>
      </DefaultLayout>
    </>
  );
}
