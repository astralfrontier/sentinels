import { ResultType } from "@remix-run/router/dist/utils";
import { map } from "ramda";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { notionRetrieve, notionSearch, SearchResult } from "../notion";
import InputWrapper from "./InputWrapper";

interface PageSearchProps {
  children?: React.ReactNode;
}

interface SearchResultViewProps {
    result: SearchResult;
}

function SearchResultView(props: SearchResultViewProps) {
    return (
        <>
            <div className="card block">
                <div className="card-content">
                    <p className="title">
                        {props.result.title}
                    </p>
                </div>
                <footer className="card-footer">
                    <p className="card-footer-item">
                        <span>
                          <Link to={`/${props.result.id}`}>Load data</Link>
                        </span>
                    </p>
                    <p className="card-footer-item">
                        <span>
                            View on <a href={props.result.url} target="_blank">Notion</a>
                        </span>
                    </p>
                </footer>
            </div>
        </>
    )
}

/**
 * Present a text field for searching for pages,
 * a button to kick off the process,
 * and a menu of found pages.
 *
 * Clicking on a found page will take you to the editor for that page.
 * There's also a link to the page on Notion.
 *
 * @param props
 * @returns
 */
function PageSearch(_props: PageSearchProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([])

  return (
    <>
      <div className="columns is-centered is-vcentered is-mobile">
        <div className="column">
            <InputWrapper label={"Deck Name"} help={"Enter the Notion page title for your deck"}>
                <input className="input" type="text" value={query} onChange={event => setQuery(event.target.value)} />
            </InputWrapper>
        </div>
        <div className="column has-text-centered">
          <button
            className="button is-primary mx-2"
            onClick={() => notionSearch(query).then(setResults)}
          >
            Search
          </button>
        </div>
      </div>
      {map(result => <SearchResultView key={result.id} result={result} />, results)}
      {results.length ? <></> : <h3>No Results</h3>}
    </>
  );
}

export default PageSearch;
