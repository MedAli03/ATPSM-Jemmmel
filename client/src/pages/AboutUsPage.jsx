// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";

const AssociationPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setSubmitted(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ربط مع الـ API الحقيقي لاحقًا
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-24 pb-16 px-4 lg:px-6 text-right"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto space-y-10 lg:space-y-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-2 leading-relaxed">
            الجمعية التونسية للنهوض بالصحة النفسية – فرع جمال
          </h1>
          <p className="text-gray-700 font-medium">
            مركز الحمّام لأطفال التوحّد بجمال
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm md:text-base mt-3">
            جمعية ذات صبغة اجتماعية تعمل تحت إشراف وزارة الشؤون الاجتماعية، تهدف
            إلى النهوض بالصحة النفسية، مرافقة الأشخاص ذوي الاضطرابات النفسية
            والتوحد، ودعم أسرهم عبر برامج علمية، تربوية وعلاجية.
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">
            تاريخ التأسيس: 21 أوت 2011 – جمال، ولاية المنستير
          </p>
        </motion.div>

        {/* Intro / Image + Text */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-slate-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="h-64 md:h-full">
              <img
                src="/about.jpeg"
                alt="مركز الحمّام لأطفال التوحّد بجمال"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
                من نحن؟
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                يعمل فرع جمال للجمعية التونسية للنهوض بالصحة النفسية على توفير
                رعاية متكاملة في مجال الصحة النفسية، مع تركيز خاص على الأطفال
                ذوي اضطراب طيف التوحّد، من خلال{" "}
                <span className="font-semibold">
                  مركز الحمائم لأطفال التوحّد
                </span>{" "}
                الذي يوفّر بيئة تربوية وعلاجية آمنة ومهيكلة.
              </p>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                يضم المركز فريقاً من الأخصائيين في الصحة النفسية، التربية
                المختصّة، التأطير الاجتماعي، يعملون بالشراكة مع الأولياء
                والمؤسسات التربوية والصحية لضمان متابعة دقيقة لمسار الطفل.
              </p>
              <ul className="text-gray-700 text-sm md:text-base space-y-2 list-disc pr-5">
                <li>مقاربة علمية تعتمد على التقييم، التخطيط والمتابعة.</li>
                <li>تعاون مستمر مع الهياكل الصحية والاجتماعية المختصة.</li>
                <li>
                  شراكة فعّالة مع الأسرة باعتبارها طرفاً أساسياً في الرعاية.
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Small stats / quick overview */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: "أطفال مكفول بهم", value: "25" },
            { label: "أعوان مباشِرون", value: "6" },
            { label: "أعوان متطوّعون", value: "2" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white shadow-md rounded-2xl px-5 py-4 text-center border border-slate-100"
            >
              <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
                {item.value}
              </div>
              <div className="mt-1 text-xs md:text-sm text-gray-600">
                {item.label}
              </div>
            </div>
          ))}
        </motion.section>

        {/* Objectives / Goals */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-slate-100"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
            أهداف الجمعية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
            <ul className="list-disc pr-5 space-y-2 text-gray-700">
              <li>التوعية بأهمية الصحة النفسية ونشر ثقافة الوقاية.</li>
              <li>
                التحسيس بطبيعة الاضطرابات النفسية وضرورة طلب الاستشارة المختصة.
              </li>
              <li>
                إنشاء ومساندة مراكز للعلاج، الرعاية والوقاية في مجال الصحة
                النفسية.
              </li>
              <li>التكفّل بالأطفال، المراهقين، الراشدين وكبار السن نفسياً.</li>
            </ul>
            <ul className="list-disc pr-5 space-y-2 text-gray-700">
              <li>دعم الإدماج الاجتماعي للأشخاص ذوي الاضطرابات النفسية.</li>
              <li>الدفاع عن حقوق المرضى النفسيين والفئات الهشة.</li>
              <li>مساندة الأسر في التعامل مع الحالات النفسية داخل العائلة.</li>
              <li>تشجيع البحث العلمي والتكوين في مجال الصحة النفسية.</li>
            </ul>
          </div>
        </motion.section>

        {/* Services / What we offer */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-slate-100"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-5">
            برامج وخدمات المركز
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                title: "تشخيص وتقييم أولي",
                desc: "فحوصات نفسية وتربوية لتحديد الصعوبات ووضع خطة تدخّل فردية.",
              },
              {
                title: "مشروع تربوي افرادي",
                desc: "إعداد برنامج خاص لكل طفل مع أهداف واضحة وقابلة للمتابعة.",
              },
              {
                title: "متابعة يومية",
                desc: "ملاحظة مستمرة، دفتر أنشطة وتقارير دورية حول تقدّم الطفل.",
              },
              {
                title: "مرافقة الأسرة",
                desc: "جلسات استماع، إرشاد وتكوين للأولياء حول كيفية التعامل مع الطفل.",
              },
              {
                title: "ورشات وأنشطة جماعية",
                desc: "تنمية المهارات الاجتماعية، التواصلية والحركية من خلال أنشطة مهيكلة.",
              },
              {
                title: "حملات توعوية",
                desc: "ندوات، لقاءات وأيام مفتوحة للتحسيس بالتوحّد والصحة النفسية.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100 transition-colors px-4 py-4"
              >
                <h3 className="font-semibold text-slate-800 mb-1 text-sm md:text-base">
                  {service.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Branch / Contact & form */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Association info */}
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
                بيانات الفرع
              </h2>
              <div className="space-y-2 text-sm md:text-base text-gray-700">
                <p>
                  <span className="font-semibold">اسم الفرع:</span> الجمعية
                  التونسية للنهوض بالصحة النفسية، فرع جمال
                </p>
                <p>
                  <span className="font-semibold">المركز:</span> مركز الحمّام
                  لأطفال التوحّد بجمال
                </p>
                <p>
                  <span className="font-semibold">العنوان:</span> نهج الطاهر
                  الحداد، حي الاستقلال 5020 جمال
                </p>
                <p>
                  <span className="font-semibold">الهاتف:</span> 73487841
                </p>
                <p>
                  <span className="font-semibold">الفاكس:</span> 73487841
                </p>
                <p>
                  <span className="font-semibold">البريد الإلكتروني:</span>{" "}
                  lescolombesjammel@outlook.fr
                </p>
              </div>
            </div>

            <div className="mt-5 text-xs text-gray-500">
              الجمعية تعمل تحت إشراف وزارة الشؤون الاجتماعية – الإدارة الجهوية
              للشؤون الاجتماعية بالمنستير.
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">
              نموذج الاتصال
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="مثال: أحمد بن علي"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  رسالتك
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="اكتب استفسارك أو طلبك هنا..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                  rows="4"
                  required
                ></textarea>
              </div>

              {submitted && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  تم إرسال رسالتك بنجاح، سنقوم بالرد عليك في أقرب وقت ممكن.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>
        </motion.section>

        {/* Google Map */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-slate-100"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
            موقع المركز
          </h2>
          <p className="text-gray-600 text-sm md:text-base mb-4">
            يمكنكم زيارة مركز الحمائم لأطفال التوحّد بجمال على العنوان المذكور،
            كما يمكنكم استعمال الخريطة التفاعلية التالية للوصول بسهولة:
          </p>
          <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-slate-200">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع المركز على الخريطة"
            ></iframe>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AssociationPage;
