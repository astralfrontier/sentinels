import React from "react";
import { useCookies } from "react-cookie";

interface AuthorizationWrapperProps {
  children?: React.ReactNode;
}

const NOTION_CLIENT_ID = import.meta.env.NOTION_CLIENT_ID
const AUTHORIZATION_URL: string = "https://api.notion.com/v1/oauth/authorize"

export function authorizationUrl(): string {
  const baseUrl = import.meta.env.VITE_REDIRECT_URI
  const redirect_uri = new URL("/oauth2/notion", baseUrl).toString()
  return `${AUTHORIZATION_URL}?client_id=${encodeURIComponent(NOTION_CLIENT_ID)}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirect_uri)}`
}

function AuthorizationButton(props: AuthorizationWrapperProps) {
  const [cookies] = useCookies(['access_token']);

  const hasAccessToken = !!cookies.access_token

  return (
    <>
      <a className={hasAccessToken ? "button is-info" : "button is-danger"} href={authorizationUrl()}>Authorize</a>
    </>
  )
}

export default AuthorizationButton;
