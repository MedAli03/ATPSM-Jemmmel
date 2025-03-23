// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const activities = [
  {
    id: 1,
    title: "ورشة عمل حول التوحد",
    description: "جلسة توعوية للأهالي حول اضطراب طيف التوحد وكيفية التعامل معه.",
    image: "/aut2.jpg",
    date: "15 مارس 2025",
  },
  {
    id: 2,
    title: "يوم رياضي للأطفال",
    description: "فعاليات رياضية للأطفال المصابين بالتوحد لتعزيز مهاراتهم الاجتماعية.",
    image: "/aut3.jpg",
    date: "22 أبريل 2025",
  },
  {
    id: 3,
    title: "محاضرة تعليمية",
    description: "محاضرة حول أحدث استراتيجيات التعليم للأطفال ذوي الاحتياجات الخاصة.",
    image: "/aut2.jpg",
    date: "10 مايو 2025",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActivitiesPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 mt-12">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
        أنشطتنا
      </h2>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: index * 0.2 }}
            variants={cardVariants}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
              <p className="text-gray-600 mt-2">{activity.description}</p>
            </div>
            <div className="bg-blue-50 text-blue-700 text-center py-2 font-semibold">
              {activity.date}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;
