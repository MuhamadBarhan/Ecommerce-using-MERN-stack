import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { baseUrl } from '../url';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Styles/Profile.css'; 

const Profile = () => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        addresses: [],
        orders: [],
        wishlist: []
    });

    const [addressExists, setAddressExists] = useState(false);

    useEffect(() => {
        // Fetch user info
        axios.get(`${baseUrl}/getuserinfo`, {
            headers: {
                'auth-token': `${localStorage.getItem('auth-token')}`
            }})
            .then((res) => {
                if (res.data) {
                    const userInfo = res.data;
                    setUserData({
                        ...userData,
                        name: userInfo.name,
                        email: userInfo.email,
                        addresses: userInfo.userInfo || [],
                        orders: userInfo.orders || [],
                        wishlist: userInfo.wishlist || [],
                    });
                    setAddressExists(userInfo.userInfo && userInfo.userInfo.length > 0);
                }
            })
            .catch((err) => {
                toast.error('Error fetching user information: ' + err.message);
            });
    }, []);

    const handleEditAddresses = () => {
        alert('Redirecting to edit addresses page...');
    };

    const navigateToOrders = () => {
        navigate('/myorders');
    };

    const navigateToWishlist = () => {
        navigate('/wishlist');
    };

    return (
        <>
            <div className="profile-container">
                <ToastContainer />
                <h2>Profile</h2>
                <div className="profile-header">
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                </div>

                <h3>Saved Addresses</h3>
                <div className="saved-addresses">
                    {userData.addresses.length > 0 ? (
                        userData.addresses.map((address, index) => (
                            <div key={index} className="saved-address-item">
                                <p>{address.street}, {address.city}, {address.state} - {address.pinCode}</p>
                                <p>Contact: {address.contactNumber}</p>
                                <button onClick={handleEditAddresses} className="edit-address-btn">
                                    Edit
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No saved addresses found.</p>
                    )}
                </div>

                <div onClick={navigateToOrders} className="orders-section">
                    <p>My Orders</p>
                </div>

                <div onClick={navigateToWishlist} className="wishlist-section">
                    <p>Wishlist</p>
                </div>

                <button className="logout-btn" onClick={() => {
                    localStorage.removeItem('auth-token');
                    window.location.replace("/");
                }}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} /> Logout
                </button>
            </div>
        </>
    );
};

export default Profile;
