import React, { useEffect, useState, forwardRef, useImperativeHandle  } from 'react';
import axios from 'axios';

import Post from '../Post/Post';
import Popup from '../Popup/Popup';

import styles from './PostContainer.module.css';

export default forwardRef(function PostContainer(props, ref) {

    const [activePostId, setActivePostId] = useState(-1);
    const [showPopup, setShowPopup] = useState(false);
    const [posts, setPosts] = useState([]);
    const [popupData, setPopupData] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');

    const DeletePost = async (post_id) => {
        const response = await axios.post("http://localhost:5000/posts/delete-post", { userId: props.user.user_id, postId: post_id });
        if(!response.data.status) {
            setErrorMsg('Error: Failed to delete post.');
            return;
        }

        setShowPopup(false);
        setPopupData([]);
        props.refresh();
    };

    // Function to refresh the posts
    const populatePosts = async () => {
        const response = await axios.post("http://localhost:5000/posts/get-posts", { userId: props.user.user_id });
        console.log(response.data);
        if(!response.data.message) {
            setPosts(response.data.posts);
        }
        else {
            setPosts([]);
        }
    };

    useImperativeHandle(ref, () => ({
        populatePosts
    }));

    useEffect(() => {
        populatePosts();
    }, []);

    const popup = (
        <Popup trigger={setShowPopup}>
            <div className={styles.post_popup}>
                <h2>Post Details</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Offering Item: <span>{popupData.offering}</span> {popupData.offeringAmount > 1 ? "x" + popupData.offeringAmount : ""}</p>
                <p>Requesting Item: <span>{popupData.requesting}</span> {popupData.requestingAmount > 1 ? "x" + popupData.requestingAmount : ""}</p>
                {popupData.isNegotiable > 0 && <p>Willing to negotiate.</p>}
                <p className={styles.created}>Created on: <time>{new Date(popupData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>
                <div className={styles.button_group}>
                    <button className={`${styles.button} ${styles.edit_button}`} onClick={() => { console.log("Edit post"); }}>Edit Post</button>
                    <button className={`${styles.button} ${styles.delete_button}`} onClick={() => { DeletePost(popupData.post_id) }}>Delete Post</button>
                </div>
            </div>
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
});