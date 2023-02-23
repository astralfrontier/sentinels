import DefaultLayout from "../layouts/Default";

interface HomePageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: HomePageProps) {
  return (
    <>
      <DefaultLayout>
        <div className="content">
          <h1 className="has-text-centered">Newman Garage</h1>

          <p>
            This is a tool for converting Notion-hosted
            Sentinels of the Universe deck descriptions
            into Digital tool JSON and Card Builder formats.
          </p>

          <p>
            Deck template:
            <a href="https://astralfrontier.notion.site/Deck-Template-7059a6378dbc4c7992fbfd3ac8ef1b60" target={"_blank"}>
              https://astralfrontier.notion.site/Deck-Template-7059a6378dbc4c7992fbfd3ac8ef1b60
            </a>
          </p>

          <p>
            Click "Duplicate" on this page.
            TODO: further instructions to come.
          </p>
        </div>
      </DefaultLayout>
    </>
  );
}
