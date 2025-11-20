/* eslint-disable no-unused-vars */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaInfoCircle, FaDna, FaChartBar } from "react-icons/fa";

const AutismPage = () => {
  const introRef = useRef(null);
  const signsRef = useRef(null);
  const causesRef = useRef(null);
  const statsRef = useRef(null);

  const introInView = useInView(introRef, { once: true, margin: "-100px" });
  const signsInView = useInView(signsRef, { once: true, margin: "-100px" });
  const causesInView = useInView(causesRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 pt-24 pb-16"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* ----------------------------------------------------------- */}
        {/* HERO / INTRO */}
        {/* ----------------------------------------------------------- */}
        <motion.section
          ref={introRef}
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 text-white px-6 py-10 sm:px-10 sm:py-12 shadow-xl"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="absolute bottom-[-4rem] right-[-3rem] h-52 w-52 rounded-full bg-indigo-500/30 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>دليل مبسّط لاضطراب طيف التوحد</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">
                فهم التوحد خطوة أولى لمرافقة أفضل للطفل والأسرة
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-100/90 leading-relaxed">
                يهدف هذا الدليل إلى تقديم معلومات واضحة ومطمئنة حول اضطراب طيف
                التوحد: ما هو، كيف يظهر، وما الذي تقوله الأبحاث الحديثة حول
                أسبابه وانتشاره.
              </p>
            </div>

            <div className="w-full lg:w-80">
              <div className="rounded-2xl bg-white/5 border border-white/15 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3 text-cyan-200 mb-3">
                  <FaInfoCircle className="text-2xl" />
                  <p className="text-sm font-semibold">
                    ما هو اضطراب طيف التوحد؟
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
                  هو اضطراب نمائي يؤثر أساسًا على طريقة تواصل الطفل وتفاعله مع
                  الآخرين، مع وجود أنماط سلوك واهتمامات متكررة. تختلف حدّته من
                  شخص لآخر، لذلك يُسمى “طيفًا”.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ----------------------------------------------------------- */}
        {/* SECTION: كيف يظهر التوحد في الحياة اليومية؟ */}
        {/* ----------------------------------------------------------- */}
        <motion.section
          ref={signsRef}
          initial="hidden"
          animate={signsInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-3xl bg-white border border-slate-200 shadow-md px-6 py-8 sm:px-8"
        >
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 mb-6">
            كيف يظهر التوحد في الحياة اليومية؟
          </h2>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
            تختلف العلامات من طفل لآخر، لكن يمكن ملاحظة بعض الأنماط المشتركة في
            ثلاث مجالات أساسية:
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "التواصل الاجتماعي",
                points: [
                  "صعوبة في بدء أو مواصلة الحوار.",
                  "تجنّب التواصل البصري أو قلّته.",
                  "صعوبة في فهم الإشارات الاجتماعية مثل تعابير الوجه.",
                ],
                color: "from-sky-500/10 to-sky-500/0 border-sky-100",
              },
              {
                title: "السلوك والاهتمامات",
                points: [
                  "حركات متكررة مثل رفرفة اليدين أو التأرجح.",
                  "تمسّك قوي بروتين معيّن وانزعاج من التغيير.",
                  "اهتمامات محددة بشكل مكثّف (لعبة، موضوع، أو نشاط).",
                ],
                color: "from-indigo-500/10 to-indigo-500/0 border-indigo-100",
              },
              {
                title: "الحسّيات (الحواس)",
                points: [
                  "حساسية زائدة أو ناقصة للأصوات أو الأضواء أو اللمس.",
                  "تجنّب بعض الملابس أو الأطعمة بسبب الملمس أو الطعم.",
                  "بحث زائد عن حركات أو أصوات معيّنة.",
                ],
                color:
                  "from-emerald-500/10 to-emerald-500/0 border-emerald-100",
              },
            ].map((block, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border bg-gradient-to-b ${block.color} p-5`}
              >
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                  {block.title}
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {block.points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ----------------------------------------------------------- */}
        {/* SECTION: ما الذي نعرفه عن الأسباب؟ */}
        {/* ----------------------------------------------------------- */}
        <motion.section
          ref={causesRef}
          initial="hidden"
          animate={causesInView ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid gap-8 lg:grid-cols-[1.2fr,0.9fr] items-start"
        >
          {/* النص الأساسي */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-md px-6 py-8 sm:px-8">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <FaDna className="text-2xl" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                ما الذي نعرفه عن مسببات التوحد؟
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
              الأبحاث الحديثة تتفق على أنه لا يوجد سبب واحد للتوحد، بل هو نتيجة
              تفاعل معقّد بين:
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">
                  • الاستعداد الجيني:
                </span>{" "}
                بعض التغيّرات في الجينات قد تزيد من احتمال الإصابة، لكنها لا
                تعني بالضرورة أن الطفل سيكون مصابًا.
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  • العوامل البيولوجية أثناء الحمل والولادة:
                </span>{" "}
                مثل بعض المضاعفات أو التعرض لحالات طبية محددة، وهي عوامل قيد
                الدراسة وليست أسبابًا قاطعة.
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  • العوامل البيئية:
                </span>{" "}
                مثل الظروف المحيطة بنمو الجنين في الرحم، وتبقى الأبحاث مستمرة
                لفهم دورها بشكل أدق.
              </li>
            </ul>

            <p className="mt-5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              من المهم التأكيد أن أنماط التربية، أو علاقة الوالدين بالطفل، لا
              تعتبر سببًا لاضطراب طيف التوحد، بل يمكن أن تكون جزءًا من الحل عبر
              المرافقة والدعم.
            </p>
          </div>

          {/* بطاقات مختصرة جانبية */}
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="space-y-4"
          >
            {[
              {
                title: "معلومة سريعة",
                content:
                  "يمكن ملاحظة بوادر التوحد من عمر 18 شهرًا، وكلما كان التدخل مبكرًا، كانت فرص التحسن أفضل.",
                tone: "from-sky-500 to-cyan-500",
              },
              {
                title: "دور العائلة",
                content:
                  "العائلة شريك أساسي في الخطة العلاجية والتربوية: الملاحظة، الدعم العاطفي، وتطبيق التوصيات اليومية.",
                tone: "from-violet-500 to-indigo-500",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className={`rounded-3xl bg-gradient-to-br ${card.tone} text-white p-5 shadow-lg`}
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {card.content}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ----------------------------------------------------------- */}
        {/* SECTION: أرقام ودلالاتها */}
        {/* ----------------------------------------------------------- */}
        <motion.section
          ref={statsRef}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-3xl bg-white border border-slate-200 shadow-md px-6 py-8 sm:px-8"
        >
          <div className="flex items-center gap-3 text-emerald-600 mb-4">
            <FaChartBar className="text-2xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              أرقام تساعدنا على فهم الصورة
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
            تختلف النسب من بلد لآخر، لكن المؤشرات العالمية توضّح أن التوحد ليس
            حالة نادرة، وأن الكثير من الأسر تشارِك نفس التجربة:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                value: "1 من 100",
                label: "تقدير تقريبي لانتشار التوحد عالميًا",
              },
              {
                value: "50٪",
                label: "قد يعانون من صعوبات تعلم أو إعاقات مصاحبة",
              },
              { value: "44٪", label: "لديهم قدرات معرفية في المعدل أو أعلى" },
              {
                value: "18٪",
                label: "احتمال أعلى للإصابة لدى الأخوة مقارنة بباقي الأطفال",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-5 text-center"
              >
                <p className="text-lg sm:text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs sm:text-sm text-slate-500 leading-relaxed text-right">
            الأرقام لا تهدف لإخافة الأسرة، بل لتأكيد أن التوحد حالة معروفة
            وموجودة في كل المجتمعات، وأن هناك اليوم مسارات علاجية وتربوية
            معترفًا بها لمساندة الطفل وعائلته.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default AutismPage;
