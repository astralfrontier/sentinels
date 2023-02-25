import { Link } from "react-router-dom";

import AppFooter from "../components/AppFooter";
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
            <AppFooter />
        </>
    )
}