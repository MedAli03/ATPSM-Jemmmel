// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const activities = [
  {
    id: 1,
    title: "ورشة عمل حول التوحد",
    description:
      "جلسة توعوية موجهة للأهالي للتعرف على اضطراب طيف التوحد وأفضل طرق التعامل اليومية.",
    image: "/aut2.jpg",
    date: "15 مارس 2025",
  },
  {
    id: 2,
    title: "يوم رياضي للأطفال",
    description:
      "أنشطة رياضية وجماعية تهدف لتنمية المهارات الاجتماعية وتعزيز الاندماج.",
    image: "/aut3.jpg",
    date: "22 أبريل 2025",
  },
  {
    id: 3,
    title: "محاضرة تعليمية",
    description:
      "محاضرة علمية حول أحدث الأساليب التربوية للأطفال ذوي الاحتياجات الخاصة.",
    image: "/aut2.jpg",
    date: "10 مايو 2025",
  },
];

const ActivitiesPage = () => {
  return (
    <div
      className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 px-4"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 -z-10">
        <div className="absolute top-10 -left-10 w-64 h-64 bg-indigo-300/20 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-0 w-72 h-72 bg-cyan-300/20 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto text-right mb-10">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-2">
          أنشطة المركز
        </p>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          فعاليات وبرامج للجميع
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl">
          مجموعة من الأنشطة الهادفة التي ننظمها طيلة السنة لدعم الأطفال،
          الأولياء، والمربين عبر تكوينات، ورشات، وبرامج إدماجية.
        </p>
      </div>

      {/* Activities Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.1 }}
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={activity.image}
                alt={activity.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Date Badge */}
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow">
                {activity.date}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 text-right">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {activity.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                {activity.description}
              </p>
            </div>

            {/* Footer / More Button */}
            <div className="flex justify-end p-4 border-t border-slate-200 bg-slate-50">
              <Link
                to={`/activities/${activity.id}`}
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-500 transition"
              >
                عرض التفاصيل →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;
