import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DefaultLayout from "../layouts/Default";
import { notionRetrieve } from "../notion";

import type { DeckData } from "../../netlify/functions/notion-retrieve"
import SentinelsData from "../components/SentinelsData";

interface SentinelsPageProps {
  children?: React.ReactNode;
}

export default function SentinelsPage(_props: SentinelsPageProps) {
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
        {deckData ? <SentinelsData deckData={deckData} /> : <></>}
      </DefaultLayout>
    </>
  );
}
