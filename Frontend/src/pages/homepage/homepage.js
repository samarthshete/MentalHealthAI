import styles from "./homepage.module.css";
import { Logo } from "../../svgs/logoSVG";
import { Link, useNavigate } from "react-router-dom";
import Image from "../../svgs/SVG/SVG/FrontImage3.svg";
import axios from "axios";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import { useContext, useRef, useEffect } from "react";
import LoginContext from "../../context/context";
import Articles from "../Articles/Articles";
import piechart from "../../svgs/piechart.png";

function Homepage() {
  const navigate = useNavigate();
  const { logout, loggedIn } = useContext(LoginContext);

  const about = useRef(null);
  const articles = useRef(null);

  const aboutClick = () => {
    about.current?.scrollIntoView({ behavior: "smooth" });
  };
  const articlesClick = () => {
    articles.current?.scrollIntoView({ behavior: "smooth" });
  };

  const logoutUser = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_LINK}/logout`,
        {
          withCredentials: true,
        }
      );
      if (data?.msg === "loggedout") {
        logout();
      }
    } catch (error) {
      console.error("Error in logout:", error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(`.${styles.animateOnScroll}`);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.homepageContainer}>
      <header>
        <div className={styles.logoContainer}>
          <Logo />
          <div className={styles.headerText}>
            <h4 className={styles.text}>Mental Health</h4>
            <h6 className={`${styles.text} text-xs`}>
              Your AI-powered mental health companion
            </h6>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          {loggedIn && (
            <button onClick={() => navigate("/analysis")}>Analyse</button>
          )}
          <button
            onClick={() => {
              if (!loggedIn) {
                navigate("/login");
              } else {
                logoutUser();
              }
            }}
          >
            {!loggedIn ? (
              <span className="flex items-center gap-2">
                Login <LuLogIn />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Logout <LuLogOut />
              </span>
            )}
          </button>
        </div>
      </header>
      <main style={{ minHeight: "100vh" }}>
        <section className={styles.leftSection}>
          <h1>
            Mental Health <br /> Solved with{" "}
            <span className={styles.ai}>AI</span>
          </h1>
          <div
            className={`${styles.chatWithUs} ${styles.animatedButton}`}
            onClick={() => navigate("/message")}
          >
            chat with us...<span className={styles.cursor}></span>
          </div>
        </section>
        <section className={styles.rightSection}>
          <img src={Image} alt="Front" />
        </section>
      </main>
      <section
        ref={about}
        className={`flex flex-col items-center gap-2 mb-4 ${styles.aboutUs} ${styles.animateOnScroll}`}
      >
        <h1 className={`text-4xl font-bold mb-4 ${styles.lato}`}>About Us</h1>
        <div className={`text-center text-lg ${styles.lato}`}>
          At <strong>TranquilMind</strong>, we are revolutionizing mental health
          care with cutting-edge AI technology. Our mission is to provide a
          safe, empathetic, and accessible space for everyone to explore their
          mental well-being. Whether you're dealing with stress, anxiety, or
          just need someone to talk to, our AI-powered assistant is here to
          guide you every step of the way. Together, we can break the stigma
          surrounding mental health and create a world where emotional
          well-being is a priority.
        </div>
        <Link to={"/aboutus"}>Discover More...</Link>
      </section>
      <section className={`mt-8 ${styles.statsBox} ${styles.animateOnScroll}`}>
        <h1 className="text-center text-4xl font-bold mb-8">
          Mental Health Issues Are Common
        </h1>
        <div className={styles.statsSection}>
          <div>
            <img
              src={piechart}
              alt="Statistics"
              className={styles.animatedChart}
            />
          </div>
          <div className="text-center flex flex-col justify-center gap-4">
            <h2 className="text-2xl">Did You Know?</h2>
            <p className="text-lg text-justify">
              Mental health conditions are more common than you might think.
              Hundreds of millions of people worldwide experience mental health
              challenges each year, and many more will face them at some point
              in their lives. For instance, 1 in 3 women and 1 in 5 men will
              experience major depression during their lifetime. While
              conditions like schizophrenia and bipolar disorder are less
              common, they still have a profound impact on individuals and their
              loved ones. Understanding and addressing mental health is crucial
              for a healthier, happier world.
            </p>
          </div>
        </div>
      </section>
      <section className="mt-8" ref={articles}>
        <h1 className="text-center text-3xl font-bold">Editor's Pick</h1>
        <div className="xl:m-auto">
          <div className={styles.Articles}>
            <Articles
              title="The Science of Happiness"
              description="Discover the latest research on what truly makes us happy and how you can apply these findings to your daily life."
              Image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              link="https://www.psychologytoday.com"
            />
            <Articles
              title="Mindfulness for Beginners"
              description="Learn the basics of mindfulness and how it can help reduce stress, improve focus, and enhance emotional well-being."
              Image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              link="https://www.mindful.org"
            />
            <Articles
              title="Breaking the Stigma: Talking About Mental Health"
              description="Explore why open conversations about mental health are crucial and how you can contribute to breaking the stigma."
              Image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              link="https://www.nami.org"
            />
            <Articles
              title="The Power of Gratitude"
              description="Find out how practicing gratitude can transform your mindset and improve your mental health."
              Image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              link="https://www.health.harvard.edu"
            />
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        <div className="m-auto h-full" style={{ maxWidth: "1320px" }}>
          <div className="grid grid-cols-2 h-5/6">
            <div className="flex flex-col justify-center items-center gap-3 text-lg">
              <div onClick={aboutClick} className="cursor-pointer">
                <Link to={"/aboutus"}>About</Link>
              </div>
              <div onClick={articlesClick} className="cursor-pointer">
                Articles
              </div>
              <div
                onClick={() => navigate("/message")}
                className="cursor-pointer"
              >
                Chat
              </div>
            </div>
            <div className="flex flex-col justify-center items-center gap-3 text-lg">
              <a
                href="https://github.com/subharthihazra/MindMate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <div>Github</div>
              </a>
              <a
                href="https://www.youtube.com/watch?v=fUD5HcZhtQI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <div>Youtube</div>
              </a>
            </div>
          </div>
          <div className="text-center">© 2024 by Algovengers</div>
        </div>
      </footer>
      <button className={styles.scrollButton} onClick={scrollToTop}>
        &#9650;
      </button>
    </div>
  );
}

export default Homepage;
