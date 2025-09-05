
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookIcon } from './icons';

const Header: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <BookIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">Grammar Story</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClass}>
                Write Story
              </NavLink>
              <NavLink to="/theory" className={navLinkClass}>
                Theory
              </NavLink>
              <NavLink to="/challenges" className={navLinkClass}>
                Challenges
              </NavLink>
              <NavLink to="/progress" className={navLinkClass}>
                Progress
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
