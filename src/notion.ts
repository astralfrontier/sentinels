export interface SearchResult {
  id: string;
  title: string;
  url: string;
}

export async function notionSearch(query: string): Promise<SearchResult[]> {
  const response = await fetch("/.netlify/functions/notion-search", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      query,
    }),
  });
  const data: SearchResult[] = await response.json();
  return data;
}

export async function notionFetchPage(id: string): Promise<any> {
  const response = await fetch("/.netlify/functions/notion-fetch", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id
    }),
  });
  const data = await response.json();
  return data;
}

export async function notionDatabasePages(id: string): Promise<any> {
  const response = await fetch("/.netlify/functions/notion-pages", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id
    }),
  });
  const data = await response.json();
  return data;
}