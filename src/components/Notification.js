import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const Notification = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen to 'announcement' event from server
    socket.on("announcement", (notification) => {
      console.log("Received notification:", notification);

      // Add new notification to the list
      setNotifications((prev) => [notification, ...prev]);
    });

    // Clean up the listener when component unmounts or socket changes
    return () => {
      socket.off("announcement");
    };
  }, [socket]);

  return (
    <div>
      <h3>Notifications</h3>
      {notifications.length === 0 && <p>No notifications yet.</p>}
      <ul>
        {notifications.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong>: {n.message} <br />
            <small>{new Date(n.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
