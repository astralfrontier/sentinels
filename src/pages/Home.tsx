import DefaultLayout from "../layouts/Default"

interface DefaultLayoutProps {
    children?: React.ReactNode
}

async function sayHello() {
    const response = await fetch("/.netlify/functions/hello")
    const data = await response.json()
    alert(data.message)
}

export default function HomePage(props: DefaultLayoutProps) {
    return (
        <>
            <DefaultLayout>
                <h1 className="title">Sentinels of the Multiverse</h1>

                <button className="button is-primary" onClick={sayHello}>Say Hello</button>
            </DefaultLayout>
        </>
    )
}