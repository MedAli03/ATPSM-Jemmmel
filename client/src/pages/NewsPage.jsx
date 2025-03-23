// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const newsArticles = [
  {
    id: 1,
    title: "إطلاق برنامج دعم جديد للأطفال",
    description:
      "تم الإعلان عن برنامج دعم خاص للأطفال المصابين بالتوحد لتعزيز مهاراتهم الاجتماعية.",
    image: "/aut1.jpg",
    date: "12 مارس 2025",
    details: "تفاصيل حول البرنامج الجديد وكيفية التسجيل والشروط المطلوبة.",
  },
  {
    id: 2,
    title: "حملة توعوية في المدارس",
    description:
      "تم تنفيذ حملة توعوية حول التوحد في العديد من المدارس المحلية لزيادة الوعي.",
    image: "/aut2.jpg",
    date: "25 أبريل 2025",
    details: "معلومات حول الأنشطة التي تم تنفيذها وأثرها على الطلاب والمجتمع.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح مركز حديث لدعم الأطفال المصابين بالتوحد وتقديم برامج متطورة.",
    image: "/aut3.jpg",
    date: "5 مايو 2025",
    details: "تفاصيل حول الخدمات التي يقدمها المركز الجديد وأهدافه المستقبلية.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح مركز حديث لدعم الأطفال المصابين بالتوحد وتقديم برامج متطورة.",
    image: "/aut3.jpg",
    date: "5 مايو 2025",
    details: "تفاصيل حول الخدمات التي يقدمها المركز الجديد وأهدافه المستقبلية.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح مركز حديث لدعم الأطفال المصابين بالتوحد وتقديم برامج متطورة.",
    image: "/aut3.jpg",
    date: "5 مايو 2025",
    details: "تفاصيل حول الخدمات التي يقدمها المركز الجديد وأهدافه المستقبلية.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح مركز حديث لدعم الأطفال المصابين بالتوحد وتقديم برامج متطورة.",
    image: "/aut3.jpg",
    date: "5 مايو 2025",
    details: "تفاصيل حول الخدمات التي يقدمها المركز الجديد وأهدافه المستقبلية.",
  },
];

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-12">
      {/* Title */}
      <motion.h1
        className="text-3xl font-bold text-center text-blue-700 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        أخبارنا
      </motion.h1>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {newsArticles.map((news, index) => (
          <motion.div
            key={news.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4 text-right">
              <h2 className="text-xl font-semibold text-gray-800">
                {news.title}
              </h2>
              <p className="text-gray-600 mt-2">{news.description}</p>
              <div className="mt-4 text-sm text-gray-500">📅 {news.date}</div>
              {/* More Button */}
              <Link
                to={`/news/${news.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                المزيد
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
