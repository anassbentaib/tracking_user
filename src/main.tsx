import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { RoutesProvider } from "./contexts/RouteContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RoutesProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            success: "shadow-lg rounded-lg px-4 py-6 mt-14",
            error: "shadow-lg rounded-lg px-4 py-6 mt-10",
            closeButton: "text-white hover:text-gray-200",
          },
        }}
      />
    </RoutesProvider>
  </StrictMode>
);
