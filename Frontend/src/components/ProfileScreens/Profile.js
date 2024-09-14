import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import "../../Css/Profile.css";
import { Link, useNavigate } from 'react-router-dom';
import Loader from "../GeneralScreens/Loader";
import { AuthContext } from '../../Context/AuthContext';
import { FiArrowLeft } from 'react-icons/fi';



const Profile = () => {
    const { config } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const editDate = (createdAt) => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const d = new Date(createdAt);
        var datestring = d.getDate() + " " + monthNames[d.getMonth()] + " , " + d.getFullYear();
        return datestring;
    }

    useEffect(() => {
        // Track page view when the component mounts
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: '/profile',
                page_title: 'Profile',
            });
        }

        const getUserProfile = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get("/user/profile", config);
                setUser(data.data);
                setLoading(false);
                trackTaskResult('Profile Page', 'Fetched successfully'); // Track success
            } catch (error) {
                trackTaskResult('Profile Page', 'Failed to fetch'); // Track failure
                navigate('/');
            }
        };

        getUserProfile();
    }, [navigate, config]);

    return (
        <>
            {
                loading ? <Loader /> :
                    <div className="Inclusive_profile_page">
                        <Link to={'/'}>
                            <FiArrowLeft />
                        </Link>
                        <div className="profile-top-wrap">
                            <span>
                                Membership Information
                            </span>
                            <a href="#!">Close Account</a>
                        </div>
                        <ul>
                            <li>
                                <span>
                                    Username
                                </span>
                                <div>
                                    {user.username}
                                </div>
                            </li>
                            <li>
                                <span>E-Mail</span>
                                <div>
                                    {user.email}
                                </div>
                            </li>
                            <li>
                                <span> Account Created Date </span>
                                <div>
                                    {editDate(user.createdAt)}
                                </div>
                            </li>
                        </ul>
                        <div className='btns_wrap'>
                            <button className='profileEditBtn'>
                                <Link to="/edit_profile">
                                    Edit Profile
                                </Link>
                            </button>
                            <button className='changePassBtn'>
                                <Link to="/change_password">
                                    Change Password
                                </Link>
                            </button>
                        </div>
                    </div>
            }
        </>
    );
}

export default Profile;
