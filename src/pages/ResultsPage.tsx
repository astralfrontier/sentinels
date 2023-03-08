import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DefaultLayout from "../layouts/Default";
import { notionErrorText, notionRetrieve } from "../notion";

import type { DeckData } from "../../netlify/functions/notion-retrieve"
import SentinelsData from "../components/SentinelsData";
import { useCookies } from "react-cookie";

interface ResultsPageProps {
  children?: React.ReactNode;
}

export default function ResultsPage(_props: ResultsPageProps) {
  const [cookies] = useCookies(['access_token']);
  const { id } = useParams();
  const [deckData, setDeckData] = useState<DeckData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)

  function hasMessage() {
    return !!message
  }

  useEffect(() => {
    if (id) {
      setIsLoading(true)
      notionRetrieve(id, cookies.access_token)
      .then(results => {
        setIsLoading(false)
        setMessage(null)
        setDeckData(results)
      })
      .catch((e) => {
        setIsLoading(false)
        const errorText = notionErrorText(e)
        setMessage(errorText)
      })
    }
  }, [])

  return (
    <>
      <DefaultLayout>
        {isLoading ? (
          <progress className="progress is-large is-info" max="100">Loading...</progress>
        ) : <></>}
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
