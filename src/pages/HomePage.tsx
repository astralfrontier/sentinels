import FriendlyTeamUp from "../assets/FriendlyTeamUp.png"
import Sleepover039 from "../assets/Sleepover_039.jpg"
import DefaultLayout from "../layouts/Default";

interface HomePageProps {
  children?: React.ReactNode;
}

export default function HomePage(props: HomePageProps) {
  return (
    <>
      <DefaultLayout>
        <div className="columns is-multiline">
          <div className="column">
            <figure className="image">
              <img src={Sleepover039} />
            </figure>
          </div>
          <div className="column">
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
            </div>
          </div>
          <div className="column">
            <figure className="image">
              <img src={FriendlyTeamUp} />
            </figure>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}
