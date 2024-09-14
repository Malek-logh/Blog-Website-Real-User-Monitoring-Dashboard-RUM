import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaUserAlt } from 'react-icons/fa';
import { AiOutlineUpload } from 'react-icons/ai';
import Loader from "../GeneralScreens/Loader";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import '../../Css/EditProfile.css';

const trackTaskResult = (taskResult) => {
    if (window.gtag) {
        window.gtag('event', 'task_result', {
            taskName: 'EditProfile',
            taskResult: taskResult
        });
    }
};

const EditProfile = () => {
    const { activeUser, config } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState('');
    const [previousPhoto, setPreviousPhoto] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Track page view when the component mounts
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: '/edit_profile',
                page_title: 'Edit Profile',
            });
        }
        
        // Set user data and loading state
        setUsername(activeUser.username);
        setEmail(activeUser.email);
        setPreviousPhoto(activeUser.photo);
        setPhoto(activeUser.photo);
        setTimeout(() => {
            setLoading(false);
        }, 1050);
    }, [navigate, activeUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append("username", username);
        formdata.append("email", email);
        formdata.append("photo", photo);

        try {
            const { data } = await axios.post("/user/editProfile", formdata, config);

            setSuccess('Profile updated successfully');
            
            trackTaskResult('Completed');
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error) {
            setError(error.response.data.error);
            trackTaskResult('Gave In');
            setTimeout(() => {
                setError('');
            }, 7000);
        }
    };

    return (
        <>
            {
                loading ? <Loader /> :
                    <div className="Inclusive-editprofile-page">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error_msg">{error}</div>}
                            {success && <div className="success_msg">{success}</div>}

                            <div className="input-wrapper">
                                <input type="text"
                                    id="username" placeholder="Username" name='username'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <label htmlFor="username">Username</label>
                            </div>

                            <div className="input-wrapper">
                                <input type="email"
                                    id="email" placeholder="Email" name='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">E-mail</label>
                            </div>

                            <div className="profile-ımg-upld-wrapper">
                                <div className="ProfilePhotoField">
                                    <FaUserAlt />
                                    <div className="txt">
                                        {photo === previousPhoto ?
                                            <div>
                                                <AiOutlineUpload />
                                                <span>Change Profile Photo</span>
                                            </div>
                                            :
                                            photo.name
                                        }
                                    </div>
                                    <input
                                        name="photo"
                                        type="file"
                                        onChange={(e) => {
                                            setPhoto(e.target.files[0]);
                                        }}
                                    />
                                </div>

                                <div className="currentImage">
                                    <div className="absolute">Current Image</div>
                                    <img src={`http://localhost:5000/userPhotos/${previousPhoto}`} alt="userPhoto" />
                                </div>
                            </div>

                            <button type='submit' className='editprofile-btn'>
                                Edit Profile
                            </button>
                        </form>
                    </div>
            }
        </>
    );
};

export default EditProfile;
