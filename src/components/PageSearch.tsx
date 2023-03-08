import { map } from "ramda";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";

import { SearchResult } from "../../netlify/functions/notion-search";
import { notionErrorText, notionSearch } from "../notion";
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
      <div className="card">
        {props.result.cover && (
          <div className="card-image">
            <figure className="image">
              <img
                src={props.result.cover}
                alt="Cover image"
                className="search-result-image"
              />
            </figure>
          </div>
        )}
        <div className="card-content">
          <p className="title">{props.result.title}</p>
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">
            <span>
              <Link
                to={`/results/notion/${props.result.id}/home`}
                className="button is-primary"
              >
                Load data
              </Link>
            </span>
          </p>
          <p className="card-footer-item">
            <span>
              View on{" "}
              <a href={props.result.url} target="_blank">
                Notion
              </a>
            </span>
          </p>
        </footer>
      </div>
    </>
  );
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
  const [cookies] = useCookies(['access_token']);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<any>(null);

  function onClickSearch() {
    setIsLoading(true);
    notionSearch(query, cookies.access_token)
      .then((results) => {
        setIsLoading(false);
        setMessage(null);
        setResults(results);
      })
      .catch((e) => {
        setIsLoading(false);
        const errorText = notionErrorText(e);
        setMessage(errorText);
      });
  }

  function hasResults() {
    return !message && results.length > 0;
  }

  function hasNoResults() {
    return !message && results.length == 0;
  }

  function hasMessage() {
    return !!message;
  }

  return (
    <>
      <div className="columns is-vcentered is-mobile">
        <div className="column">
          <InputWrapper
            label={"Deck Name"}
            help={"Enter the Notion page title for your deck"}
            isExpanded={true}
          >
            <input
              className="input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputWrapper>
        </div>
        <div className="column has-text-centered is-narrow">
          <button className="button is-primary mx-2" onClick={onClickSearch}>
            Search
          </button>
        </div>
      </div>
      {isLoading ? (
        <progress className="progress is-large is-info" max="100">
          Loading...
        </progress>
      ) : (
        <></>
      )}
      <div className="columns is-multiline">
        {hasMessage() ? (
          <div className="column is-narrow">
            <div className="notification is-danger">{message}</div>
          </div>
        ) : (
          <></>
        )}
        {hasResults() ? (
          map(
            (result) => (
              <div className="column is-one-third" key={result.id}>
                <SearchResultView result={result} />
              </div>
            ),
            results
          )
        ) : (
          <></>
        )}
        {hasNoResults() ? (
          <div className="column is-narrow">
            <div className="notification is-info">
              <p>No Results</p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default PageSearch;
