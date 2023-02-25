import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DefaultLayout from "../layouts/Default";
import { notionErrorText, notionRetrieve } from "../notion";

import type { DeckData } from "../../netlify/functions/notion-retrieve"
import SentinelsData from "../components/SentinelsData";

interface SentinelsPageProps {
  children?: React.ReactNode;
}

export default function SentinelsPage(_props: SentinelsPageProps) {
  const { id } = useParams();
  const [deckData, setDeckData] = useState<DeckData | null>(null)
  const [message, setMessage] = useState<any>(null)

  function hasMessage() {
    return !!message
  }

  useEffect(() => {
    if (id) {
      notionRetrieve(id)
      .then(results => {
        setMessage(null)
        setDeckData(results)
      })
      .catch((e) => {
        const errorText = notionErrorText(e)
        setMessage(errorText)
      })
    }
  }, [])

  return (
    <>
      <DefaultLayout>
        {hasMessage() ? (
          <div className="column is-narrow">
            <div className="notification is-danger">
              {message}
            </div>
          </div>
        ) : <></>}
        {deckData ? <SentinelsData deckData={deckData} /> : <></>}
      </DefaultLayout>
    </>
  );
}
