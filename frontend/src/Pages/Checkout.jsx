import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './Styles/Checkout.css';
import { baseUrl } from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    pinCode: '',
    district: '',
    state: '',
    contactNumber: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [addressExists, setAddressExists] = useState(false);

  useEffect(() => {
    axios.get(`${baseUrl}/getuserinfo`, {
      headers: {
        'auth-token': localStorage.getItem('auth-token')
      }
    })
    .then((res) => {
      if (res.data) {
        const userInfo = res.data.userInfo;
        setFormData({
          street: userInfo.street || '',
          city: userInfo.city || '',
          pinCode: userInfo.pinCode || '',
          district: userInfo.district || '',
          state: userInfo.state || '',
          contactNumber: userInfo.contactNumber || ''
        });
        setAddressExists(true);
      }
    })
    .catch((err) => {
      toast.error(`No address found or error fetching address: ${err.response ? err.response.data : err.message}`);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${baseUrl}/saveinfo`, formData, {
      headers: {
        'auth-token': localStorage.getItem('auth-token'),
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      toast.success(res.data.message || 'Address saved successfully'); // Show success toast
      setTimeout(() => {
        navigate('/ordersummary'); // Navigate after 1 second
      }, 1000);
    })
    .catch((err) => {
      toast.error(`Error saving address: ${err.response ? err.response.data : err.message}`);
    });
  };

  return (
    <div className="order-form-container">
      <ToastContainer autoClose={2000} />
      <h2>{addressExists ? 'Your address details' : 'Enter your details'}</h2>
      {addressExists && !editMode ? (
        <div>
          <div><strong>Street:</strong> {formData.street}</div>
          <div><strong>City:</strong> {formData.city}</div>
          <div><strong>Pin Code:</strong> {formData.pinCode}</div>
          <div><strong>District:</strong> {formData.district}</div>
          <div><strong>State:</strong> {formData.state}</div>
          <div><strong>Contact Number:</strong> {formData.contactNumber}</div>
          <button className="order-form-btn" onClick={() => setEditMode(true)}>Edit Address</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Form groups */}
        </form>
      )}
    </div>
  );
};

export default Checkout;
