import Header from "../../../components/Header/NoLinkHeader";
import Footer from "../../../components/Footer/Footer";
import DashboardSidebar from '../../../components/DashboardSidebar/DashboardSidebar';
import PostContainer from "../../../components/PostContainer/PostContainer";

import styles from "./ActiveDashboard.module.css";

export default function ActiveDashboard(props) {

    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <DashboardSidebar user={props.user} setUser={props.setUserr} />
                <section>
                    <h1>My Active Posts</h1>
                    <p>Welcome to your dashboard, {props.user.email}!</p>
                    <PostContainer user={props.user} setUser={props.setUser} />
                </section>
            </main>
            <Footer />
        </>
    );
}