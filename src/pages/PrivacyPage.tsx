import DefaultLayout from "../layouts/Default";
import Privacy from "../privacy.md";

interface PrivacyPageProps {
  children?: React.ReactNode;
}

export default function PrivacyPage(props: PrivacyPageProps) {
  return (
    <>
      <DefaultLayout>
        <div className="content">
          <Privacy />
        </div>
      </DefaultLayout>
    </>
  );
}
