import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Contact.module.css";

export default function Contact() {
    return (
        <>
            <Header />
            <main className={"main " + styles.main}>
                <h1>Contact</h1>
            </main>
            <Footer />
        </>
    );
}