import React from "react";

import { SentinelsDataDisplayProps } from "./SentinelsData";

export default function SentinelsDataDebug(props: SentinelsDataDisplayProps) {
  return (
    <>
      <pre>{JSON.stringify(props.deckData, null, 2)}</pre>
    </>
  );
}
