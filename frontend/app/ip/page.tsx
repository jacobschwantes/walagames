"use client";

import { useEffect, useState } from "react";

function Home() {
  const [location, setLocation] = useState("");
  useEffect(() => {
      fetch("http://localhost:8081/ip", {
        method: "GET",

    })
      .then((res) => res.text())
      .then((data) => {
        setLocation(data);
      });
  }, []);
  return <div className="text-white text-2xl">{location}</div>;
}

export default Home;
