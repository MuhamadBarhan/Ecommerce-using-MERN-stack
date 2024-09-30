import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../../src/form.css';
import Illustration from '../data/illustration.svg';
import { baseUrl } from '../url';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ClipLoader from "react-spinners/ClipLoader"; 

function Login() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // State to track login request progress
  const [formData, setFormData] = useState({
    password: "",
    email: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true); // Start loader

    try {
      const res = await axios.post(`${baseUrl}/login`, formData);

      if (res.data.success) {
        toast.success('Login Successful!');
        localStorage.setItem('auth-token', res.data.token);
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        toast.error(res.data.errors || 'Login failed!');
      }
    } catch (error) {
      const responseError = error.response?.data?.errors;
      toast.error(responseError || 'Failed to login!'); // Display error via toast
    } finally {
      setLoading(false); // Stop loader after request
    }
  }

  return (
    <section className="formCard">
      <ToastContainer autoClose={2000}/>
      <div className="formContainer">
        <div className="illustration">
          <img
            src={Illustration}
            alt="Login Illustration"
            style={{ width: '500px', height: '400px' }}
          />
        </div>

        <form className="form" onSubmit={submit}>
          <span className="formHeading">Login</span>
          <input
            id="ip1"
            type="email"
            name="email"
            value={formData.email}
            onChange={changeHandler}
            placeholder="Email"
            required
          />
          <div className="password-container">
            <input
              id="ip2"
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={changeHandler}
              placeholder="Password"
              required
            />
            <button
              onClick={togglePasswordVisibility}
              className="toggle-password"
              type="button"
            >
              <FontAwesomeIcon
                className="pass-icon"
                icon={passwordVisible ? faEyeSlash : faEye}
              />
            </button>
          </div>

          {/* Button with loader */}
          <button
            type="submit"
            className="formBtn"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <ClipLoader color={"#ffffff"} size={12} /> // Loader displayed when loading
            ) : (
              "Login"
            )}
          </button>

          <Link to="/forgotpass" className="formLink">Forgot Password?</Link>
          <p className="formLink">
            Don't have an account? <Link to="/signup">Create one!</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;
