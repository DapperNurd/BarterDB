import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Home.module.css";

export default function Home(props) {
    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            <main className={"main " + styles.main}>
                <h1>WIP</h1>
            </main>
            <Footer />
        </>
    );
}