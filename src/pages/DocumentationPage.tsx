import DefaultLayout from "../layouts/Default";
import Documentation from "./documentation.md";

export default function DocumentationPage() {
  return (
    <>
      <DefaultLayout>
        <div className="content">
          <Documentation />
        </div>
      </DefaultLayout>
    </>
  );
}
