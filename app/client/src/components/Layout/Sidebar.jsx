import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isSalesman, isBM, isAdmin, logout } = useAuth();
  const location = useLocation();

  const salesmanLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/log-visit', label: 'Log Visit', icon: PlusCircleIcon },
    { to: '/my-visits', label: 'My Visits', icon: ClipboardDocumentListIcon },
    { to: '/my-targets', label: 'My Targets', icon: FlagIcon },
    { to: '/dealers', label: 'Dealers', icon: BuildingStorefrontIcon },
    { to: '/notifications', label: 'Notifications', icon: BellIcon },
  ];

  const bmLinks = [
    { to: '/bm-dashboard', label: 'BM Dashboard', icon: HomeIcon },
    { to: '/bm-log-visit', label: 'Log My Visit', icon: PlusCircleIcon },
    { to: '/team-performance', label: 'Team Performance', icon: ChartBarIcon },
    { to: '/set-targets', label: 'Set Targets', icon: FlagIcon },
    { to: '/manage-salesmen', label: 'Manage Salesmen', icon: UsersIcon },
    { to: '/manage-dealers', label: 'Manage Dealers', icon: BuildingStorefrontIcon },
    { to: '/reports', label: 'Reports', icon: ChartBarIcon },
    { to: '/notifications', label: 'Notifications', icon: BellIcon },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Panel', icon: ShieldCheckIcon },
    { to: '/reports', label: 'All Reports', icon: ChartBarIcon },
    { to: '/manage-dealers', label: 'Manage Dealers', icon: BuildingStorefrontIcon },
    { to: '/manage-salesmen', label: 'Manage Salesmen', icon: UsersIcon },
    { to: '/notifications', label: 'Notifications', icon: BellIcon },
  ];

  const links = isAdmin ? adminLinks : isBM ? bmLinks : salesmanLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FOS</span>
            </div>
            <span className="font-bold text-lg text-gray-800">Visit Tracker</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <CogIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;