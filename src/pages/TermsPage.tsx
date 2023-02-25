import DefaultLayout from "../layouts/Default";

interface TermsOfUseProps {
  children?: React.ReactNode;
}

export default function TermsOfUsePage(props: TermsOfUseProps) {
  return (
    <>
      <DefaultLayout>
        <div className="content">
          <h1>Terms of Use</h1>
          <p>Coming soon</p>
        </div>
      </DefaultLayout>
    </>
  );
}
