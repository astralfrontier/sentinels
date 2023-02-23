import React from "react";

import * as deckData from "../../samples/netherwarden.json"
import SentinelsData from "../components/SentinelsData";
import DefaultLayout from "../layouts/Default";

interface TestPageProps {
  children?: React.ReactNode;
}

export default function TestPage(_props: TestPageProps) {
  return (
    <>
      <DefaultLayout>
        {deckData ? <SentinelsData deckData={deckData} /> : <></>}
      </DefaultLayout>
    </>
  );
}
