import { Handler } from "@netlify/functions";
import axios from "axios"

interface OAuthHandlerRequest {
    code: string;
}

const NOTION_TOKEN_URL = "https://api.notion.com/v1/oauth/token"
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID as string
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET as string

const notionSearchHandler: Handler = async (event, _context) => {
  const body: OAuthHandlerRequest = JSON.parse(event.body || '')
  const { code } = body

  const baseUrl = process.env.VITE_REDIRECT_URI
  const redirect_uri = new URL("/oauth2/notion", baseUrl).toString()

  try {
    const response = await axios({
      url: NOTION_TOKEN_URL,
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        grant_type: "authorization_code",
        code,
        redirect_uri  
      },
      auth: {
        username: NOTION_CLIENT_ID,
        password: NOTION_CLIENT_SECRET
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };  
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

export { notionSearchHandler as handler };
