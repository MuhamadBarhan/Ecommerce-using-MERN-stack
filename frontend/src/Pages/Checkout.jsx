import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import './Styles/Checkout.css';
import { baseUrl } from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';


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
  const [addressList, setAddressList] = useState([]); // To store all addresses
  const [editMode, setEditMode] = useState(false); // Flag for edit mode
  const [addingNewAddress, setAddingNewAddress] = useState(false); // Flag for adding new address
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null); // To know which address is selected

  useEffect(() => {
    // Fetch user info and addresses
    axios.get(`${baseUrl}/getuserinfo`, {
      headers: {
        'auth-token': localStorage.getItem('auth-token')
      }
    })
      .then((res) => {
        if (res.data) {
          const userInfo = res.data.userInfo || [];
          setAddressList(userInfo); // Set the list of addresses
        }
      })
      .catch((err) => {
        console.log(`No address found or error fetching address: ${err.response ? err.response.data : err.message}`);
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

    axios.post(`${baseUrl}/saveinfo`, {
      index: editMode ? selectedAddressIndex : undefined, // Include index if in edit mode
      address: formData
    }, {
      headers: {
        'auth-token': localStorage.getItem('auth-token'),
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        toast.success(res.data.message || 'Address saved successfully');
        // Fetch updated address list from the server
        return axios.get(`${baseUrl}/getuserinfo`, {
          headers: {
            'auth-token': localStorage.getItem('auth-token')
          }
        });
      })
      .then((res) => {
        const userInfo = res.data.userInfo || [];
        setAddressList(userInfo); // Update the list of addresses
        setFormData({ street: '', city: '', pinCode: '', district: '', state: '', contactNumber: '' });
        setEditMode(false);
        setAddingNewAddress(false);
        setSelectedAddressIndex(null);
      })
      .catch((err) => {
        toast.error(`Error saving address: ${err.response ? err.response.data : err.message}`);
      });
  };

  const handleEdit = (index) => {
    setFormData(addressList[index]); // Set form data to the selected address
    setEditMode(true);
    setSelectedAddressIndex(index);
    setAddingNewAddress(false); // Hide 'Add New Address' mode
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const token = localStorage.getItem('auth-token'); // Get the token
      axios.post(`${baseUrl}/deleteinfo`, {
        index, // Send index to identify which address to delete
      }, {
        headers: {
          'auth-token': token, // Ensure the token is included
          'Content-Type': 'application/json',
        }
      })
        .then(res => {
          toast.success(res.data.message || 'Address deleted successfully');
          // Fetch updated address list from the server
          return axios.get(`${baseUrl}/getuserinfo`, {
            headers: {
              'auth-token': token, // Include the token here as well
            }
          });
        })
        .then((res) => {
          const userInfo = res.data.userInfo || []; // If no addresses, default to empty array
          if (userInfo.length === 0) {
            toast.info("No address found");
          }
          setAddressList(userInfo); // Update the address list
          setSelectedAddressIndex(null); // Reset selected index
        })
        .catch((err) => {
          toast.error(`Error deleting address: ${err.response ? err.response.data : err.message}`);
        });
    }
  };


  const handleAddNewAddress = () => {
    setFormData({ street: '', city: '', pinCode: '', district: '', state: '', contactNumber: '' });
    setEditMode(false);
    setAddingNewAddress(true); // Show 'Add New Address' form
    setSelectedAddressIndex(null); // Reset selected index
  };

  const handleNext = () => {
    if (selectedAddressIndex !== null) {
      // Navigate to order summary page
      navigate('/ordersummary');
    } else {
      toast.warn('Please select an address or add new before proceeding.');
    }
  };

  return (
    <div className="order-form-container">
      <ToastContainer autoClose={2000} />
      <h2>{editMode ? 'Edit Address' : addingNewAddress ? 'Add New Address' : 'Saved Addresses'}</h2>

      {/* Conditionally render the form if editMode or addingNewAddress is true */}
      {(editMode || addingNewAddress) ? (
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="street">Street:</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City:</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pinCode">Pin Code:</label>
              <input
                type="text"
                id="pinCode"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="district">District:</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State:</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number:</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className='order-form-input'
                required
              />
            </div>
            <button className='order-form-btn' type="submit">
              {editMode ? 'Update Address' : 'Save Address'}
            </button>
            <button className="order-form-btn" onClick={() => {
              setEditMode(false);
              setAddingNewAddress(false);
              setSelectedAddressIndex(null); // Reset selected index
              setFormData({ street: '', city: '', pinCode: '', district: '', state: '', contactNumber: '' });
            }}>Cancel</button>
          </form>
        </div>
      ) : (
        <>
          {/* Display saved addresses as cards with radio buttons */}
          <div className="address-list">
            {addressList.length > 0 ? (
              addressList.map((address, index) => (
                <div key={index} className="address-card">
                  <input
                    type="radio"
                    id={`address-${index}`}
                    name="selectedAddress"
                    checked={selectedAddressIndex === index}
                    onChange={() => setSelectedAddressIndex(index)}
                  />
                  <label htmlFor={`address-${index}`}>
                    <p>{address.street}, {address.city}, {address.district}, {address.state} - {address.pinCode}</p>
                    <p>Contact: {address.contactNumber}</p>
                  </label>
                  <button className="order-form-btn" onClick={() => handleEdit(index)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="order-form-btn delete-btn" onClick={() => handleDelete(index)}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>

                </div>
              ))
            ) : (
              <p>No addresses found. Please add a new address.</p>
            )}
          </div>

          <button className="order-form-btn" onClick={handleAddNewAddress}>
            <FontAwesomeIcon icon={faPlus} /> Add Address
          </button>

        </>
      )}

      <button className="formBtn" onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default Checkout;
