// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const ContactPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        {/* عنوان الصفحة */}
        <motion.div
          className="text-center mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.25em] mb-2">
            تواصل معنا
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            يسعدنا الاستماع إليكم
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            إذا كان لديكم استفسار، اقتراح، أو طلب مرافقة لطفلكم، يمكنكم مراسلتنا
            عبر النموذج التالي أو استعمال بيانات الاتصال الظاهرة أسفله.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
          {/* نموذج الاتصال */}
          <motion.div
            className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 sm:p-7"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              أرسل لنا رسالة
            </h2>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                // هنا ممكن تربط مع API لاحقًا
                alert("تم إرسال رسالتك بنجاح!");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                    placeholder="مثال: أحمد بن علي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                  placeholder="مثال: 73 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                  placeholder="استفسار حول التسجيل، ملاحظة، اقتراح..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  نص الرسالة
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                إرسال الرسالة
              </button>
            </form>
          </motion.div>

          {/* بيانات الاتصال + خريطة مبسطة */}
          <motion.div
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-xl">
              <h2 className="text-xl font-bold mb-4">بيانات الاتصال</h2>

              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-1 h-5 w-5 text-cyan-300" />
                  <p>
                    نهج الطاهر الحداد، حي الاستقلال
                    <br />
                    5020 جمال، ولاية المنستير – تونس
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone className="h-5 w-5 text-cyan-300" />
                  <p>73 487 841</p>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail className="h-5 w-5 text-cyan-300" />
                  <p>lescolombesjammel@outlook.fr</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-300">
                أوقات العمل: الاثنين إلى الجمعة – من 8:00 إلى 16:00
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-56">
              <iframe
                title="موقع الجمعية على الخريطة"
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
