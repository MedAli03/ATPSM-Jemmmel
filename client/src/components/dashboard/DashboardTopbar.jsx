import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardTopbar = () => {
  const { logout, currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sample notifications data
  const notifications = [
    { id: 1, text: 'لديك طلب جديد من عميل', time: 'منذ 10 دقائق', read: false },
    { id: 2, text: 'تم تأكيد حجزك', time: 'منذ ساعة', read: true },
    { id: 3, text: 'تم تحديث سياسة الخصوصية', time: 'منذ يوم', read: false },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <button className="md:hidden mr-4 text-gray-500 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">لوحة التحكم</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                <div className="py-2 border-b">
                  <div className="px-4 py-2 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">الإشعارات</h3>
                    <button className="text-blue-600 text-sm">تعليم الكل كمقروء</button>
                  </div>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-gray-500">لا توجد إشعارات جديدة</p>
                    </div>
                  )}
                </div>
                <Link 
                  to="/notifications" 
                  className="block text-center py-3 text-sm font-medium text-blue-600 hover:bg-gray-50"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>
          
          {/* User Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {currentUser?.avatar ? (
                <img 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
              )}
              <span className="ml-2 text-gray-700 hidden sm:inline">
                {currentUser?.name || 'المستخدم'}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-500 ml-1 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  الملف الشخصي
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  الإعدادات
                </Link>
                <Link
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  تسجيل الخروج
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;