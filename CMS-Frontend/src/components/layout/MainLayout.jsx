import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* FIXED: Added the closing </footer> tag here */}
      <footer className="py-6 border-t border-gray-200 bg-white text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Meri Dukaan. All rights reserved.
      </footer> 
    </div>
  );
}

export default MainLayout;