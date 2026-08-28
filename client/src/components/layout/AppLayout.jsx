import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <Sidebar />
      </div>

      {/* Main Application Area */}
      <div className="min-h-screen lg:ml-64">
        <Navbar />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
    </div>
  );
}

export default AppLayout;