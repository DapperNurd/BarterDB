import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Home.module.css";

export default function Home() {
    return (
        <>
            <Header />
            <main className={"main " + styles.main}>
                <h1>Home</h1>
            </main>
            <Footer />
        </>
    );
}