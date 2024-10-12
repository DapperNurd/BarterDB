import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Account.module.css";

export default function Account(props) {

    return (
        <>
            <Header user={props.user} setUser={props.setUser}/>
            <main className={"main " + styles.main}>
                <h1>Account Settings</h1>
            </main>
            <Footer />
        </>
    );
}