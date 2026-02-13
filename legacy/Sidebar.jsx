import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Squares2X2Icon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  FolderOpenIcon,
  ArchiveBoxIcon,
  QrCodeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { AuthContext } from '../../context/AuthContext.jsx';
import packageJson from '../../../package.json';

const Sidebar = ({ isCollapsed, onToggle, isMobile = false, onMobileMenuClose }) => {
  const location = useLocation();
  const { isGlobalAdmin, business_key } = useContext(AuthContext);

  // Build navigation array based on user role
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
    { name: 'QuickText', href: '/quicktext', icon: ChatBubbleLeftRightIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Assets', href: '/assets', icon: ArchiveBoxIcon },
    { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
    { name: 'QR Code', href: '/qrcode', icon: QrCodeIcon },
  ];

  // Add Business/Businesses menu item based on role
  const businessMenuItem = isGlobalAdmin
    ? { name: 'Businesses', href: '/businesses', icon: BuildingOffice2Icon }
    : business_key
    ? { name: 'Business', href: `/businesses/view/${business_key}`, icon: BuildingOfficeIcon }
    : null;

  const navigation = [
    ...baseNavigation,
    ...(businessMenuItem ? [businessMenuItem] : []),
    { name: 'Users', href: '/users', icon: UsersIcon }
  ];

  return (
    <div className={cn(
      'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-none border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img 
              src="/alliance_forge_logo_red.png" 
              alt="Alliance Forge Logo" 
              className="h-10 object-contain"
            />
          </div>
        )}
        <button
          onClick={isMobile ? onMobileMenuClose : onToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isMobile ? (
            <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          // For root path, check exact match; for others, check if pathname starts with href
          const isActive = item.href === '/' 
            ? location.pathname === item.href
            : location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                // Close mobile menu when navigation item is clicked
                if (isMobile && onMobileMenuClose) {
                  onMobileMenuClose();
                }
              }}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <item.icon className={cn('w-5 h-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Alliance Forge Portal v{packageJson.version}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
