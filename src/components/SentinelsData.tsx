import React, { useState } from "react";

import { DeckData } from "../../netlify/functions/notion-retrieve";
import SentinelsDataCardBuilder from "./SentinelsDataCardBuilder";
import SentinelsDataDebug from "./SentinelsDataDebug";
import SentinelsDataJson from "./SentinelsDataJson";

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
    name: "Digital Tool JSON",
    element: SentinelsDataJson
  },
  {
    name: "Card Builder",
    element: SentinelsDataCardBuilder
  },
  {
    name: "Debug",
    element: SentinelsDataDebug
  },
]

export default function SentinelsData(props: SentinelsDataProps) {
  const [selectedTab, setSelectedTab] = useState<number>(0)
  const { deckData } = props;

  return (
    <>
      <div className="tabs">
        <ul>
          {tabs.map((tab, idx) => (
            <li className={selectedTab == idx ? "is-active" : ""} onClick={() => setSelectedTab(idx)}><a>{tab.name}</a></li>
          ))}
        </ul>
      </div>
      {tabs[selectedTab].element({deckData})}
    </>
  );
}
