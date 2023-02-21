import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DefaultLayout from "../layouts/Default";
import { notionRetrieve } from "../notion";

import type { Setup, Card, Relationship } from "../../netlify/functions/notion-retrieve"

interface NotionPageProps {
  children?: React.ReactNode;
}

interface DeckData {
  setup: Setup[];
  cards: Card[];
  relationships: Relationship[];
}

export default function SentinelsPage(_props: NotionPageProps) {
  const { id } = useParams();
  const [deckData, setDeckData] = useState<DeckData | null>(null)

  useEffect(() => {
    if (id) {
      notionRetrieve(id).then(setDeckData)
    }
  }, [])

  return (
    <>
      <DefaultLayout>
        <h1 className="title">Page dump: {id}</h1>

        <pre>{JSON.stringify(deckData, null, 2)}</pre>
      </DefaultLayout>
    </>
  );
}
