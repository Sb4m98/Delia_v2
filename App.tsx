import React, { useContext } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/pages/HomePage';
import UploadPage from './components/pages/UploadPage';
import ChatPage from './components/pages/ChatPage';
import ProcessPage from './components/pages/ProcessPage';
import { AppContext } from './context/AppContext';
import { DeliaLogo, MenuIcon } from './components/ui/Icons';

const App: React.FC = () => {
  const { activePage, isSidebarCollapsed, isMobileMenuOpen, toggleMobileMenu } = useContext(AppContext);

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <HomePage />;
      case 'Upload':
        return <UploadPage />;
      case 'Chat':
        return <ChatPage />;
      case 'Process':
        return <ProcessPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f3ff] overflow-hidden">
      <Sidebar />
      
      {isMobileMenuOpen && (
        <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleMobileMenu}
            aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between p-4 border-b border-gray-200">
          <DeliaLogo className="h-10 w-auto" />
          <button onClick={toggleMobileMenu} aria-label="Open menu">
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;