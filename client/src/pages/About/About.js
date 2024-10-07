import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./About.module.css";

export default function About() {
    return (
        <>
            <Header />
            <main className={"main " + styles.main}>
                <h1>About</h1>
            </main>
            <Footer />
        </>
    );
}