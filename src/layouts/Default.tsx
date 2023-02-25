import { Link } from "react-router-dom";

import AppNavbar from "../components/AppNavbar";

interface DefaultLayoutProps {
    children?: React.ReactNode
}

export default function DefaultLayout(props: DefaultLayoutProps) {
    return (
        <>
            <AppNavbar />
            <div className="container">
                {props.children}
            </div>
            <footer className="footer">
                <div className="content has-text-centered">
                    <Link to={"/privacy"}>Privacy Policy</Link> |
                    <a href={"https://github.com/astralfrontier/newman-garage"} target={"_blank"}>Github</a>
                </div>
            </footer>
        </>
    )
}