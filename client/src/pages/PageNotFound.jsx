// src/pages/PageNotFound.jsx
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">
        الصفحة غير موجودة
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو قد تم نقلها.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
      >
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
};

export default PageNotFound;