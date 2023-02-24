import React from "react";

import CopyableText from "./CopyableText";
import { SentinelsDataDisplayProps } from "./SentinelsData";

export default function SentinelsDataDebug(props: SentinelsDataDisplayProps) {
  const jsonText = JSON.stringify(props.deckData, null, 2)

  return (
    <>
      <CopyableText text={jsonText} />
    </>
  );
}
