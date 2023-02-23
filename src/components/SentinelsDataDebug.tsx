import React from "react";

import { SentinelsDataDisplayProps } from "./SentinelsData";

export default function SentinelsDataDebug(props: SentinelsDataDisplayProps) {
  const jsonText = JSON.stringify(props.deckData, null, 2)

  function copyToClipboard() {
    navigator.clipboard.writeText(jsonText)
    alert("Copied")
  }

  return (
    <>
      <pre>
        <button className='button is-primary is-pulled-right' onClick={copyToClipboard}>Copy</button>
        {jsonText}
      </pre>
    </>
  );
}
