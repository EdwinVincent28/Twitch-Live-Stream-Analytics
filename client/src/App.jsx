import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./pages/Dashboard";
import ChatBot from "./pages/ChatBot";
import StreamRewind from "./pages/StreamRewind";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard />,
    chatbot: <ChatBot />,
    rewind: <StreamRewind />,
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar page={page} />
        <main className="flex-1 overflow-auto">
          {pages[page]}
        </main>
      </div>
    </div>
  );
}