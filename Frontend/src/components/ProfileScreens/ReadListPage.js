import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Loader from "../GeneralScreens/Loader";
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { AuthContext } from '../../Context/AuthContext';
import { AiFillLock } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';
import ReadListStoryItem from '../StoryScreens/ReadListStoryItem';
import '../../Css/ReadListPage.css';

const ReadListPage = () => {
    const navigate = useNavigate();
    const [readList, setReadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { config, activeUser } = useContext(AuthContext);

    useEffect(() => {
        // Track page view when the component mounts
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: '/readList',
                page_title: 'Reading List',
            });
        }

        const getUserReadingList = async () => {
            setLoading(true);

            try {
                const { data } = await axios.get(`/user/readList`, config);
                setReadList(data.data);
            } catch (error) {
                console.error("Error fetching reading list:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        getUserReadingList();
    }, [navigate, config]);

    const editDate = (createdAt) => {
        const d = new Date(createdAt);
        const options = { month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    };

    return (
        <>
            {loading ? <Loader /> :
                <div className="Inclusive-readList-page">
                    <Link to={'/'}>
                        <FiArrowLeft />
                    </Link>
                    <h2>Reading List</h2>

                    <div className="readList-top-block">
                        <img src={`/userPhotos/${activeUser.photo}`} alt={activeUser.username} />

                        <div className='activeUser-info-wrapper'>
                            <b>{activeUser.username}</b>
                            <div>
                                <span>{editDate(Date.now())}</span>
                                <span>-</span>
                                <span>{activeUser.readListLength} stories</span>
                                <i><AiFillLock /></i>
                            </div>
                        </div>

                        <i className='BsThreeDots-icon'>
                            <BsThreeDots />
                        </i>
                    </div>

                    <div className="readList-story-wrapper">
                        {readList.length > 0 ?
                            readList.map(story => (
                                <ReadListStoryItem key={story._id} story={story} editDate={editDate} />
                            ))
                            :
                            <div className="empty-readList">Reading List is empty</div>
                        }
                    </div>
                </div>
            }
        </>
    );
}

export default ReadListPage;
