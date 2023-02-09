import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DefaultLayout from "../layouts/Default";
import { notionDatabasePages, notionFetchPage } from "../notion";

interface NotionPageProps {
  children?: React.ReactNode;
}

interface Database {
  id: string;
  title: string;
}

export default function SentinelsPage(props: NotionPageProps) {
  const { id } = useParams();
  const [databases, setDatabases] = useState<Database[]>([])
  const [setupDb, setSetupDb] = useState<string>("")
  const [cardsDb, setCardsDb] = useState<string>("")
  const [relationshipsDb, setRelationshipsDb] = useState<string>("")

  useEffect(() => {
    notionFetchPage(id || "").then(setDatabases)
  }, [id])

  useEffect(() => {
    const setters: any = {"Setup": setSetupDb, "Cards": setCardsDb, "Relationships": setRelationshipsDb}
    for (let db of databases) {
      notionDatabasePages(db.id).then(result => setters[db.title](result))
    }
  }, [databases])

  return (
    <>
      <DefaultLayout>
        <h1 className="title">Page dump: {id}</h1>

        <pre>{JSON.stringify(setupDb, null, 2)}</pre>
        <pre>{JSON.stringify(cardsDb, null, 2)}</pre>
        <pre>{JSON.stringify(relationshipsDb, null, 2)}</pre>
      </DefaultLayout>
    </>
  );
}
