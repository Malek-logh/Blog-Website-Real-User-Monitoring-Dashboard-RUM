import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../Css/ForgotPassword.css";
import { BsArrowBarLeft } from 'react-icons/bs';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  let startTime;

  useEffect(() => {
    startTime = Date.now(); // Capture the start time when the component mounts

    // Track page view
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: '/forgotpassword',
        page_title: 'Forgot Password',
      });
    }
  }, []);

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("/auth/forgotpassword", { email });
      setSuccess(data.message);
      
      // Track success event with gtag
      if (window.gtag) {
        window.gtag('event', 'task_result', {
          'taskName': 'ForgotPassword',
          'taskResult': 'Completed'
        });
      }
    } catch (error) {
      setError(error.response.data.error);
      setEmail("");
      
      // Track failure event with gtag
      if (window.gtag) {
        window.gtag('event', 'task_result', {
          'taskName': 'ForgotPassword',
          'taskResult': 'Gave In'
        });
      }
      
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  return (
    <div className="Inclusive-forgotPassword-page">
      <div className="forgotPassword-big-wrapper">
        <Link to="/" className="back_home">
          <BsArrowBarLeft />
        </Link>
        <form onSubmit={forgotPasswordHandler}>
          <div className="top-forgotpassword-explain">
            <h3>Forgot Password</h3>
            <p>
              Please enter the email address you registered your account with. We
              will send you a reset password confirmation to this email.
            </p>
          </div>

          {error && <div className="error_message">{error}</div>}
          {success && <div className="success_message">{success} - 
            <Link to="/" className="ml-3">Go home</Link>
          </div>}

          <div className="input-wrapper">
            <input
              type="email"
              required
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">E-mail</label>
          </div>

          <button type="submit">
            Send Email
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
