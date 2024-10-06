import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./Error.css";

export default function Error() {
    return (
        <>
            <Header />
            <main className="main">
                <h1 className="Error">Error 404: Page not found.</h1>
            </main>
            <Footer />
        </>
    );
}