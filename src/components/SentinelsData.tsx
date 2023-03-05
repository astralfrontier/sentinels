import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import { DeckData } from "../../netlify/functions/notion-retrieve";
import SentinelsDataCardBuilder from "./SentinelsDataCardCreator";
import SentinelsDataDebug from "./SentinelsDataDebug";
import SentinelsDataJson from "./SentinelsDataJson";
import SentinelsDataStatistics from "./SentinelsDataStatistics";

interface SentinelsDataProps {
  children?: React.ReactNode;
  deckData: DeckData;
}

export interface SentinelsDataDisplayProps {
  children?: React.ReactNode;
  deckData: DeckData;
}

const tabs = [
  {
    name: "Statistics",
    tab: "home",
    element: SentinelsDataStatistics
  },
  {
    name: "Digital Tool JSON",
    tab: "digital",
    element: SentinelsDataJson
  },
  {
    name: "Card Creator",
    tab: "cc",
    element: SentinelsDataCardBuilder
  },
  {
    name: "Debug",
    tab: "debug",
    element: SentinelsDataDebug
  },
]

export default function SentinelsData(props: SentinelsDataProps) {
  const location = useLocation()
  const { currentTab } = useParams();
  const { deckData } = props;

  const tabUrl = (newtab: string) => location.pathname.replace(/\/[^\/]*$/, `/${newtab}`)

  return (
    <>
      <div className="tabs">
        <ul>
          {tabs.map((t) => (
            <li key={t.tab} className={(currentTab == t.tab) ? "is-active" : ""}>
              <Link to={tabUrl(t.tab)}>{t.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      {tabs.map((t) => 
        <div key={t.tab} id={`sentinels-tab-${t.tab}`} className={(currentTab == t.tab) ? "" : "is-hidden"}>
          {t.element({deckData})}
        </div>
      )}
    </>
  );
}
