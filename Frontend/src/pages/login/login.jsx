import { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./login.module.css";
import InputBox from "../../components/inputBox/inputBox";
import Button from "../../components/button/button";
import GoogleIcon from "../../svgs/googleicon.png";
import {
  LoginWithEmail,
  LoginWithGoogle,
  SignupWithEmail,
} from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import LoginContext from "../../context/context";

function Login() {
  const [isRegistered, setIsRegister] = useState(true);
  const [loginData, setLoginData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useContext(LoginContext);

  useEffect(() => {
    if (isRegistered) {
      setError({
        email: "",
        password: "",
      });
    } else {
      setError({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [isRegistered]);

  const handleLoginDataChange = (e, field) => {
    setLoginError(false);
    const value = e.target.value;
    setLoginData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleLoginWithGoogle = async () => {
    try {
      const res = await LoginWithGoogle();
      if (res) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const LoginandSignup = async () => {
    try {
      if (isRegistered) {
        await LoginWithEmail(loginData.email, loginData.password);
      } else {
        await SignupWithEmail(loginData.email, loginData.password);
      }
      setLogging(false);
      setLoggedIn(true);
    } catch (error) {
      setLoginError(true);
      toast.error(
        isRegistered ? "Invalid credentials" : "Error creating account",
        { position: "top-right" }
      );
      setErrorMessage(error.message);
      setLogging(false);
    }
  };

  const handleSubmitButton = (e) => {
    e.preventDefault();

    if (loginData.email === "" || loginData.password === "") {
      toast.error("Please enter all the fields", { position: "top-right" });
      return;
    }

    const isCorrectMail = loginData.email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    if (!isCorrectMail) {
      toast.error("Please enter a correct email", { position: "top-right" });
      return;
    }
    if (!isRegistered && loginData.password.length < 8) {
      toast.error("Please enter a longer password", { position: "top-right" });
      return;
    }

    setLogging(true);
    LoginandSignup();
  };

  useEffect(() => {
    if (loggedIn) {
      login();
      navigate("/message");
    }
  }, [loggedIn, login, navigate]);

  return (
    <div className={styles.pageContainer}>
      <ToastContainer />
      <div className={styles.pageContent}>
        <div className={styles.leftContainer}>
          <form className={styles.loginContainer} onSubmit={handleSubmitButton}>
            <header>
              {isRegistered ? (
                <h2>
                  Welcome Back <span>👋</span>
                </h2>
              ) : (
                <h2>
                  Register a New Account <span>👇</span>
                </h2>
              )}
            </header>
            <main>
              <InputBox
                label="Email"
                name="email"
                type="email"
                disabled={logging}
                value={loginData.email}
                handleChange={handleLoginDataChange}
                placeholder="example@email.com"
              />
              <InputBox
                label="Password"
                name="password"
                type="password"
                disabled={logging}
                value={loginData.password}
                handleChange={handleLoginDataChange}
                placeholder="At least 8 characters"
              />
              <Button
                text={isRegistered ? "Sign in" : "Sign up"}
                type="submit"
                handleClick={handleSubmitButton}
                logging={logging}
                style={{
                  backgroundColor: isRegistered
                    ? "rgb(144, 0, 64)"
                    : "rgb(0, 144, 101)",
                }}
              />
              <div className="text-center mt-2 opacity-70">
                <span style={{ font: `'Inter', sans-serif` }}>OR</span>
              </div>
              <div
                className={styles.googleButton}
                onClick={handleLoginWithGoogle}
              >
                <img
                  src={GoogleIcon}
                  alt="Google Icon"
                  className={styles.googleImage}
                />
                <div>{isRegistered ? "Sign in " : "Sign up "}with Google</div>
              </div>
            </main>
            <footer>
              {isRegistered
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <span
                onClick={() => {
                  setIsRegister((prev) => !prev);
                  setLoginData({
                    name: "",
                    email: "",
                    password: "",
                  });
                }}
                style={{ cursor: "pointer", color: "blue" }}
              >
                {isRegistered ? "Sign up" : "Sign in"}
              </span>
            </footer>
          </form>
        </div>
        <div className={styles.rightContainer}>
          {/* Optional image or illustration */}
        </div>
      </div>
    </div>
  );
}

export default Login;
