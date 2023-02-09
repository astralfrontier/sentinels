import React from "react";

interface InputWrapperProps {
  label: string;
  help: string;
  isExpanded?: boolean;
  children?: React.ReactNode;
}

function InputWrapper(props: InputWrapperProps) {
  const controlClass = props.isExpanded ? "control is-expanded" : "control"
  return (
    <div className="field">
      <label className="label" id={props.label}>
        {props.label}
      </label>
      <div className={controlClass}>
        <div className="select is-rounded">{props.children}</div>
      </div>
      <p className="help">{props.help}</p>
    </div>
  );
}

export default InputWrapper;
