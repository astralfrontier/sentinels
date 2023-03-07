import DefaultLayout from "../layouts/Default";
import Terms from "../terms.md";

interface TermsOfUseProps {
  children?: React.ReactNode;
}

export default function TermsOfUsePage(props: TermsOfUseProps) {
  return (
    <>
      <DefaultLayout>
        <div className="content">
          <Terms />
        </div>
      </DefaultLayout>
    </>
  );
}
