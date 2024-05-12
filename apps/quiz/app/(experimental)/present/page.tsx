"use client";
import type { NextPage } from "next";
import { useEffect, useState, useRef } from "react";

interface PageProps {}
const Page: NextPage<PageProps> = ({}) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <ReceiverApp />
    </main>
  );
};
export default Page;

const ReceiverApp = () => {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (navigator.presentation.receiver) {
      navigator.presentation.receiver.connectionList.then((list) => {
        list.connections.forEach((connection) => {
          if (!connectionRef.current) {
            connectionRef.current = connection;
            connection.addEventListener("message", (event) => {
              console.log("Received message:", event.data);
            //   setMessages((prevMessages) => [...prevMessages, event.data]);
              setCount((prevCount) => prevCount + 1);
            });
          }
        });

        list.addEventListener("connectionavailable", (event) => {
          const newConnection = event.connection;
          if (!connectionRef.current) {
            connectionRef.current = newConnection;
            newConnection.addEventListener("message", (event) => {
              console.log("Received message:", event.data);
              setMessages((prevMessages) => [...prevMessages, event.data]);
              setCount((prevCount) => prevCount + 1);
            });
          }
        });
      });
    }
  }, []);

  return (
    <div>
      <h1>Receiver Application</h1>
      <span className="text-8xl">count: {count}</span>
      <div className="flex flex-col">
        {messages.map((msg) => (
          <div key={msg}>
            <span>{JSON.stringify(msg)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


