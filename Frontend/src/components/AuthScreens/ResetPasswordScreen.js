import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../Css/ResetPasswordScreen.css";

// Track task results function
const trackTaskResult = (taskResult) => {
  if (window.gtag) {
    window.gtag('event', 'task_result', {
      taskName: 'ResetPassword',
      taskResult: taskResult
    });
  }
};

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { resetToken } = useParams();

  // Track page view event
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: '/reset_password',
        page_title: 'ResetPassword'
      });
    }
  }, []);

  const resetPasswordHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmpassword) {
      setPassword("");
      setConfirmPassword("");
      setError("Passwords do not match");

      // Track task result as failure
      trackTaskResult('Gave In');
      return;
    }

    try {
      const { data } = await axios.put(
        `/auth/resetpassword/${resetToken}`,
        { password }
      );

      setSuccess(data.data);

      // Track task result as success
      trackTaskResult('Completed');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setError(error.response.data.error);
      setPassword("");
      setConfirmPassword("");

      // Track task result as failure
      trackTaskResult('Gave In');
    }
  };

  return (
    <div className="Inclusive-resetPassword-page">
      <div className="resetPassword-big-wrapper">
        <form onSubmit={resetPasswordHandler}>
          <h3>Reset Your Password</h3>
          {error && <div className="error_message">{error}</div>}
          {success && <div className="success_message">{success}</div>}
          <div className="input-wrapper">
            <input
              type="password"
              required
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">New Password</label>
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              required
              id="confirmpassword"
              placeholder="Confirm new password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="confirmpassword">Confirm Password</label>
          </div>
          <button type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
