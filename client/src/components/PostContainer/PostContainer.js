import React, {useEffect, useState} from 'react';
import axios from 'axios';

import Post from '../Post/Post';
import Popup from '../Popup/Popup';

import styles from './PostContainer.module.css';

export default function PostContainer(props) {

    const [showPopup, setShowPopup] = useState(false);
    const [posts, setPosts] = useState([]);
    const [popupData, setPopupData] = useState([]);

    useEffect(() => {
        const populatePosts = async () => {
            const response = await axios.post("http://localhost:5000/api/getposts", { userId: props.user.user_id });
            if(!response.data.message) {
                setPosts(response.data.posts);
            }
            else {
                setPosts(null);
            }
        }
        populatePosts();
    }, []);

    // props.setData({
    //     offering: props.data.offering_item_id,
    //     offeringAmount: props.data.offering_amount,
    //     requesting: props.data.requesting_item_id,
    //     requestingAmount: props.data.requesting_amount,
    //     isNegotiable: props.data.isNegotiable,
    //     createdAt: props.data.created_at
    // })

    const popup = (
        <Popup trigger={setShowPopup}>
            <h2>Post Details</h2>
            <p>Offering Item: <span>{popupData.offering}</span> {popupData.offeringAmount > 1 ? "x" + popupData.offeringAmount : ""}</p>
            <p>Requesting Item: <span>{popupData.requesting}</span> {popupData.requestingAmount > 1 ? "x" + popupData.requestingAmount : ""}</p>
            {popupData.isNegotiable > 0 && <p>Willing to negotiate.</p>}
            <p>Created on: <time>{new Date(popupData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>
        </Popup>
    );

    return (
        <>
            {showPopup && popup}
            <div className={styles.container}>
                {posts.map(function(post, i) {
                    return <Post key={i} id={posts[i].post_id} data={posts[i]} setData={setPopupData} setShowPopup={setShowPopup} />;
                })}
            </div>

        </>
    );
}