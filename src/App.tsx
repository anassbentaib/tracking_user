import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden">
      <Header />
      <Sidebar />
    </div>
  );
}
