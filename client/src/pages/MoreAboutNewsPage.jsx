import { useParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const newsArticles = [
  {
    id: 1,
    title: "إطلاق برنامج دعم جديد للأطفال",
    description:
      "تم الإعلان عن برنامج دعم خاص للأطفال المصابين بالتوحد لتعزيز مهاراتهم الاجتماعية.",
    image: "/aut1.jpg",
    date: "12 مارس 2025",
    details:
      "تفاصيل حول البرنامج الجديد وكيفية التسجيل والشروط المطلوبة. يهدف البرنامج إلى تقديم دعم متكامل للأطفال المصابين بالتوحد، من خلال ورش عمل تعليمية وجلسات دعم نفسي للأهالي. سيتم توفير استشارات مجانية من قبل مختصين في المجال.",
  },
  {
    id: 2,
    title: "حملة توعوية في المدارس",
    description:
      "تم تنفيذ حملة توعوية حول التوحد في العديد من المدارس المحلية لزيادة الوعي.",
    image: "/aut1.jpg",
    date: "25 أبريل 2025",
    details:
      "تهدف الحملة إلى تعريف الطلاب والمدرسين بأهمية تقبل الأطفال المصابين بالتوحد، وتقديم ورش عمل تثقيفية. تخلل الحدث أنشطة تفاعلية تهدف إلى تعزيز التفاعل الاجتماعي بين الأطفال.",
  },
  {
    id: 3,
    title: "افتتاح مركز جديد لدعم الأطفال",
    description:
      "افتتاح مركز حديث لدعم الأطفال المصابين بالتوحد وتقديم برامج متطورة.",
    image: "/aut1.jpg",
    date: "5 مايو 2025",
    details:
      "يعد هذا المركز خطوة مهمة في تقديم رعاية متخصصة للأطفال المصابين بالتوحد. يتضمن المركز غرفًا تعليمية مجهزة بأحدث الوسائل، وجلسات فردية مع مختصين، بالإضافة إلى توفير الدعم للأهالي من خلال ندوات وورش عمل متخصصة.",
  },
];

const MoreAboutNewsPage = () => {
  const { id } = useParams();
  const news = newsArticles.find((n) => n.id === parseInt(id));

  if (!news) {
    return <p className="text-center text-red-500 mt-10">المقال غير موجود</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-12">
      <motion.div
        className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-72 object-cover rounded-lg"
        />
        <h1 className="text-3xl font-bold text-blue-700 mt-4">{news.title}</h1>
        <p className="text-gray-500 mt-2">📅 {news.date}</p>
        <p className="text-gray-700 mt-4">{news.details}</p>
        {/* Back Button */}
        <Link
          to="/news"
          className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          العودة إلى الأخبار
        </Link>
      </motion.div>
    </div>
  );
};

export default MoreAboutNewsPage;
