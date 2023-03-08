import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";

import DefaultLayout from "../layouts/Default";

interface OAuth2PageProps {
  children?: React.ReactNode;
}

interface AuthorizationData {
  access_token: string;
  duplicated_template_id?: string;
}

async function callOAuthEndpoint(code: string) {
  const response = await fetch(`/.netlify/functions/notion-oauth`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ code }),
  });
  return response.json();
}

export default function OAuth2Page(_props: OAuth2PageProps) {
  const [cookies, setCookie] = useCookies(['access_token']);
  const navigate = useNavigate();
  const useQuery = () => new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const code = useQuery().get("code") as string;

  useEffect(() => {
    callOAuthEndpoint(code)
      .then((response: AuthorizationData) => {
        // TODO: cookie duration?
        setCookie("access_token", response.access_token, {
          path: "/"
        })
        if (response.duplicated_template_id) {
          navigate(`/results/notion/${response.duplicated_template_id}/home`)
        } else {
          navigate("/search/notion")
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  }, []);

  if (loading) {
    return (
      <>
        <DefaultLayout>
          <h1 className="title">Requesting Authorization...</h1>
        </DefaultLayout>
      </>
    );
  } else if (error) {
    return (
      <>
        <DefaultLayout>
          <h1 className="title">Error</h1>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </DefaultLayout>
      </>
    );
  } else {
    return (
      <>
        <DefaultLayout>
          <h1 className="title">No Response</h1>
          <p>Please use the "Authorize" button to log in</p>
        </DefaultLayout>
      </>
    );
  }
}
