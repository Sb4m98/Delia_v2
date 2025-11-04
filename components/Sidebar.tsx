import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import type { Page } from '../types';
import { HomeIcon, UploadIcon, ChatIcon, ProcessIcon, DeliaLogo, ChevronDoubleLeftIcon } from './ui/Icons';

const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, toggleMobileMenu } = useContext(AppContext);

  const navItems: { name: Page; icon: React.ReactElement }[] = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Upload', icon: <UploadIcon /> },
    { name: 'Chat', icon: <ChatIcon /> },
    { name: 'Process', icon: <ProcessIcon /> },
  ];

  const pageTranslations: Record<Page, string> = {
    Home: 'Home',
    Upload: 'Carica File',
    Chat: 'Chat',
    Process: 'Processi',
  };

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  return (
    <aside className={`fixed top-0 left-0 h-full z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      w-64 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 
      ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
    `}>
      <div className={`flex items-center gap-2 p-4 mb-8 ${isSidebarCollapsed ? 'lg:justify-center' : 'justify-start'}`}>
        <DeliaLogo className="h-12 w-auto" isCollapsed={isSidebarCollapsed} />
      </div>
      <nav className="flex flex-col gap-2 px-4">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.name)}
            className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activePage === item.name
                ? 'bg-brand-purple text-white'
                : 'text-brand-purple-dark hover:bg-brand-purple-light'
            } ${isSidebarCollapsed ? 'lg:justify-center' : 'justify-start'}`}
            title={pageTranslations[item.name]}
          >
            {item.icon}
            <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''}`}>{pageTranslations[item.name]}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4 hidden lg:block">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-2 p-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <ChevronDoubleLeftIcon className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          <span className={`${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Comprimi</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;