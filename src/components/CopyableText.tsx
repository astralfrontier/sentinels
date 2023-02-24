import React from "react";

interface CopyableTextProps {
  text: string;
  children?: React.ReactNode;
}

function CopyableText(props: CopyableTextProps) {
  function copyToClipboard() {
    navigator.clipboard.writeText(props.text)
    alert("Copied")
  }

  return (
    <>
      <pre>
        <button className='button is-primary is-pulled-right' onClick={copyToClipboard}>Copy</button>
        {props.text}
      </pre>
    </>
  );
}

export default CopyableText;
