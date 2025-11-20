// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const newsArticles = [
  {
    id: 1,
    title: "إطلاق برنامج دعم جديد للأطفال",
    description:
      "تم الإعلان عن برنامج دعم خاص بالأطفال ذوي طيف التوحد لتعزيز مهاراتهم الاجتماعية والتواصلية داخل المركز وخارجه.",
    image: "/aut1.jpg",
    date: "12 مارس 2025",
    details: "تفاصيل حول البرنامج الجديد وكيفية التسجيل والشروط المطلوبة.",
  },
  {
    id: 2,
    title: "حملة توعوية في المدارس",
    description:
      "تنفيذ سلسلة لقاءات تحسيسية في عدد من المدارس حول التوحد، لمساندة الإدماج وتعزيز فهم حاجيات الأطفال.",
    image: "/aut2.jpg",
    date: "25 أبريل 2025",
    details:
      "معلومات حول الأنشطة التي تم تنفيذها وأثرها على التلاميذ والأولياء.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح فضاء حديث مجهز بقاعات علاج وظيفي، جلسات نطق، وأنشطة جماعية موجهة للأطفال ذوي طيف التوحد.",
    image: "/aut3.jpg",
    date: "5 مايو 2025",
    details: "تفاصيل حول الخدمات التي يقدمها المركز الجديد وأهدافه المستقبلية.",
  },
  {
    id: 4,
    title: "يوم مفتوح للأولياء",
    description:
      "تنظيم يوم مفتوح لتمكين الأولياء من التعرف على البرامج المعتمدة، الفريق، ومسارات المرافقة المتاحة.",
    image: "/aut1.jpg",
    date: "20 يونيو 2025",
    details: "برمجة اليوم المفتوح، الفقرات، وطريقة المشاركة.",
  },
  {
    id: 5,
    title: "ورشة تكوين للمربين",
    description:
      "ورشة تكوينية حول استراتيجيات التعامل مع أطفال طيف التوحد داخل الأقسام العادية وأقسام الإدماج.",
    image: "/aut2.jpg",
    date: "10 يوليو 2025",
    details: "محاور الورشة والفئة المستهدفة وكيفية التسجيل.",
  },
  {
    id: 6,
    title: "شراكة جديدة مع مؤسسة صحية",
    description:
      "إبرام اتفاقية تعاون مع مؤسسة صحية لتسهيل مسار التشخيص والمتابعة الطبية للأطفال.",
    image: "/aut3.jpg",
    date: "1 سبتمبر 2025",
    details: "أهداف الشراكة والخدمات المشتركة التي سيتم توفيرها.",
  },
];

const NewsPage = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 pt-24 pb-16 px-4"
      dir="rtl"
    >
      {/* Hero / Header */}
      <motion.div
        className="max-w-6xl mx-auto text-right mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-2">
          مستجدات المركز
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
          أخبار وأنشطة الجمعية
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          اكتشف آخر البرامج، الحملات، والفعاليات التي تنظمها الجمعية التونسية
          للنهوض بالصحة النفسية – فرع جمال ومركز الحمّام لأطفال التوحد.
        </p>
      </motion.div>

      {/* News Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((news, index) => (
            <motion.article
              key={`${news.id}-${index}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {/* Image + overlay date */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-100 shadow">
                  {news.date}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5 text-right">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
                  {news.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {news.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[0.7rem] sm:text-xs font-medium text-indigo-600">
                    خبر من أنشطة المركز
                  </span>

                  <Link
                    to={`/news/${news.id}`}
                    className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    قراءة التفاصيل
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
