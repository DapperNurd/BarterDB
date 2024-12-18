import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Error.module.css";

export default function Error(props) {
    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            <main className={"main " + styles.main}>
                <h1 className="Error">Error 404: Page not found.</h1>
            </main>
            <Footer />
        </>
    );
}