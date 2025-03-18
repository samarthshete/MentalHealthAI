import { useNavigate } from "react-router-dom";
import { Logo } from "../../svgs/logoSVG";
import styles from "./message.module.css";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Markdown from "react-markdown";
import LoginContext from "../../context/context";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import Chat from "./Chat";

function LoaderRipple() {
  return (
    <div className={styles["lds-ripple"]}>
      <div></div>
      <div></div>
    </div>
  );
}

function Message() {
  const [chatId, setChatId] = useState(null);
  const navigate = useNavigate();
  const { logout, loggedIn } = useContext(LoginContext);
  const mainRef = useRef();
  const [chat, setChat] = useState([]);
  const [chatState, setChatState] = useState("busy");
  const [chatInit, setChatInit] = useState(false);
  const [message, setMessage] = useState("");
  const ws = useRef(null);

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [chat]);

  // Fetch initial chat data (chatId)
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_LINK}/chat`,
          { withCredentials: true }
        );
        setChatId(data.chatId);
        console.log("Chat Data:", data);
      } catch (error) {
        console.log("Error Fetching Data:", error);
      }
    }
    fetchData();
  }, []);

  // Establish WebSocket connection once chatId is available
  useEffect(() => {
    if (chatId !== null) {
      const wss = new WebSocket(
        `${process.env.REACT_APP_WS_LINK}?id=${chatId}`
      );
      ws.current = wss; // Set reference immediately

      wss.addEventListener("open", () => {
        console.log("WebSocket connected");
        // Send initial messages on connection
        ws.current.send(JSON.stringify({ type: "client:connected" }));
        ws.current.send(JSON.stringify({ type: "client:chathist" }));
      });

      wss.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data?.type === "server:chathist") {
          const histdata = data.data;
          if (!histdata) return;

          // Append conversation history messages
          histdata.forEach((conv) => {
            if (conv.prompt) {
              setChat((prev) => [...prev, { message: conv.prompt, own: true }]);
            }
            if (conv.response) {
              setChat((prev) => [
                ...prev,
                { message: conv.response, own: false },
              ]);
            }
          });

          setChatState("idle");
          setChatInit(true);
        } else if (data?.type === "server:response:chunk") {
          // Update the latest bot message with new chunk data
          setChat((prev) => {
            const lastMessage = prev.at(-1);
            return [
              ...prev.slice(0, -1),
              {
                message: `${lastMessage.message}${data.chunk}`,
                own: false,
                isLoading: true,
              },
            ];
          });
        } else if (data?.type === "server:response:end") {
          // Mark the bot's message as complete
          setChat((prev) => {
            const lastMessage = prev.at(-1);
            return [
              ...prev.slice(0, -1),
              {
                message: lastMessage.message,
                own: false,
                isLoading: false,
              },
            ];
          });
          setChatState("idle");
        }
      });
    }
  }, [chatId]);

  // Handle sending a message
  const handleClick = () => {
    // Append user's message
    setChat((prev) => [...prev, { message, own: true }]);
    ws.current?.send(
      JSON.stringify({
        type: "client:prompt",
        prompt: message,
      })
    );
    setMessage("");
    setChatState("busy");
    // Append placeholder for bot's response (to be updated via WebSocket)
    setChat((prev) => [...prev, { message: "", own: false, isLoading: true }]);
  };

  // Logout functionality
  const logoutUser = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_LINK}/logout`,
        { withCredentials: true }
      );
      console.log("Logout Data:", data);
      if (data?.msg === "loggedout") {
        logout();
      }
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <div className={styles.messageContainer}>
      <header>
        <div
          className={styles.logoContainer}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <Logo />
          <div className={styles.headerText}>
            <h4>MindMate</h4>
            <h6>A mental health chat assistance</h6>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <button
            onClick={() => {
              if (!loggedIn) navigate("/login");
              else navigate("/analysis");
            }}
          >
            Analyse
          </button>
          <button
            onClick={() => {
              if (!loggedIn) navigate("/login");
              else logoutUser();
            }}
          >
            {!loggedIn ? <LuLogIn /> : <LuLogOut />}
          </button>
        </div>
      </header>
      <main
        ref={mainRef}
        style={
          !chatInit || chat.length === 0
            ? {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }
            : {}
        }
      >
        {!chatInit && (
          <div className={styles.loadingChatInit}>
            <LoaderRipple />
          </div>
        )}
        {chatInit && chat.length === 0 && (
          <div className={styles.emptyChat}>
            No Previous Chat History!
            <br />
            Chat with me now.
          </div>
        )}
        {chatInit &&
          chat.map((x, i) => (
            <Chat
              text={x.message}
              own={x.own}
              key={i}
              isLoading={x.isLoading || false}
            />
          ))}
      </main>
      <footer>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={chatState === "busy"}>
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

export default Message;
