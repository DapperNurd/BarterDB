import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Home.module.css";

export default function Home(props) {
    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            <main className={"main " + styles.bigger}>
            <h1>Welcome to BarterDB</h1>
            <p>BarterDB is an anonymous, collaborative bartering tool. At BarterDB, the ogal is to anonymously bring users together to exchange goodsin a secure and flexible environment. Users have the ability to form a partnership with another user of their choice(BarterDB does not have a direct communication system), modify their goods inventory, and barter goods with other users!</p> BarterDB takes a fee from every transaction directly based on the amount and type of goods traded per user.
            <br></br>
            <br></br>
            
            <h1>Getting Started</h1>
            <ol className={styles.li}>
                <li>Register your account from the login screen</li>
                <li>Wait for your account to be verified</li>
                <li>Create or accept a partnership request</li>
                <li>Manage your inventory</li>
                <li>Start bartering!</li>
            </ol>
            <br></br>

            <h1>BarterDB Origin</h1>
            <p>This website was create for our CS360 class project for Fall 2024 at the University of Idaho. We we tasked with building a four person (2 partnership) bartering system. The system had to have user level for basic website users and admin level accounts to manage the users. A user can form a partnership with another user then begin posting requests/offers of items to trade for other items. The system automatically matches user's post with other users' posts that fit the criteria. If desired, the two users can barter on their trade before finalizing the transaction with their partners. Admin level accounts have the ability to delete/suspend users and manage the inventory system. </p>
            <br></br>
            </main>
            <Footer />
        </>
    );
}