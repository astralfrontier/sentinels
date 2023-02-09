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
        </>
    )
}