import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./ClassroomChat.css";

function ClassroomChat({ sessionId }) {
  const bottomRef = useRef(null);

  const storageKey =
    `classroom-chat-${sessionId}`;

  const [messages, setMessages] =
    useState(() => {
      try {
        const storedMessages =
          localStorage.getItem(storageKey);

        if (storedMessages) {
          return JSON.parse(storedMessages);
        }
      } catch {
        // Use the initial message below.
      }

      return [
        {
          id: 1,
          user: "Trainer",
          text: "Welcome to the digital classroom!",
          time: new Date().toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
        },
      ];
    });

  const [input, setInput] =
    useState("");

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(messages)
    );

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, storageKey]);

  const sendMessage = () => {
    const messageText = input.trim();

    if (!messageText) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      user: "Student",
      text: messageText,
      time: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);

    setInput("");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h3>Classroom Chat</h3>

        <p>
          <span />
          Live discussion
        </p>
      </header>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.user === "Student"
                ? "student-message"
                : "trainer-message"
            }`}
          >
            <div className="message-meta">
              <strong>
                {message.user}
              </strong>

              <span>
                {message.time}
              </span>
            </div>

            <p>{message.text}</p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          placeholder="Type message..."
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ClassroomChat;