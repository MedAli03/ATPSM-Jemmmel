import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCompass,
  FiHeart,
  FiUsers,
  FiUserCheck,
  FiLayers,
  FiCalendar,
  FiBookOpen,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const Header = () => {
  return (
    <Box
      sx={{
        direction: "rtl",
        bgcolor: "#edf0f5",
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white"
        dir="rtl"
      >
        {/* soft blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Text side */}
            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>رسالتنا</span>
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight max-w-xl">
                نرافق أطفال طيف التوحد وأسرهم برؤية علمية وإنسانية متكاملة
              </h1>

              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-100/90 leading-relaxed">
                نوفّر مسارًا تربويًا وعلاجيًا يوميًا، يديره فريق متعدد
                الاختصاصات، حتى يحصل كل طفل على خطة تناسب احتياجاته، مع مرافقة
                حقيقية للأسر.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm sm:text-base font-semibold text-slate-900 shadow-sm transition hover:bg-cyan-300 focus-visible:outline-none"
                >
                  تعرّف على خدماتنا
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  تواصل معنا
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:text-sm text-slate-100/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  +10 سنوات خبرة ميدانية
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <FiCompass className="h-4 w-4" />
                  مسار رقمي لمتابعة الطفل والأسرة
                </span>
              </div>
            </div>

            {/* Highlight card */}
            <div className="lg:pl-6">
              <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-7 backdrop-blur-xl shadow-2xl">
                <p className="text-xs font-semibold text-cyan-100/90">
                  تأثيرنا في الميدان
                </p>
                <p className="mt-2 text-sm text-slate-100/85">
                  أرقام حية من مركز الحمّام لأطفال التوحد بجمال:
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  {[
                    { label: "الأطفال المنتفعون", value: "25", icon: FiUsers },
                    {
                      label: "الأعوان المباشرون",
                      value: "6",
                      icon: FiUserCheck,
                    },
                    { label: "أسر مرافقة", value: "40+", icon: FiHeart },
                    { label: "مجموعات نشطة", value: "6", icon: FiLayers },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.7rem] sm:text-xs text-slate-100/80">
                          {item.label}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/40 text-cyan-200">
                          <item.icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-2 text-lg sm:text-xl font-bold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[0.7rem] sm:text-xs text-slate-100/70 leading-relaxed">
                  نقيس التطور يوميًا عبر منصّة داخلية لمتابعة المشاريع التربوية
                  الفردية (PEI)، الأنشطة، والملاحظات بين الفريق والأولياء.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-8">
        <div className="rounded-3xl bg-white shadow-lg border border-slate-200/70 px-5 sm:px-7 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="text-right">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                الأثر بالأرقام
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">
                منظومة عمل متكاملة حول الطفل والأسرة.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md text-right">
              هذه المؤشرات تلخص عمل الفريق داخل المركز، من تكفّل مباشر، مرافقة
              للأولياء، وتنشيط تربوي وعلاجي مستمر.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                label: "الأطفال المستفيدون",
                value: 25,
                icon: FiUsers,
                accent: "from-indigo-500 to-indigo-400",
              },
              {
                label: "الأسر المساندة",
                value: 40,
                icon: FiHeart,
                accent: "from-rose-500 to-rose-400",
              },
              {
                label: "المختصون العاملون",
                value: 6,
                icon: FiUserCheck,
                accent: "from-violet-500 to-violet-400",
              },
              {
                label: "المجموعات النشطة",
                value: 6,
                icon: FiLayers,
                accent: "from-emerald-500 to-emerald-400",
              },
              {
                label: "فعاليات سنوية",
                value: 12,
                icon: FiCalendar,
                accent: "from-sky-500 to-sky-400",
              },
              {
                label: "أخبار منشورة",
                value: 24,
                icon: FiBookOpen,
                accent: "from-amber-500 to-amber-400",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-white"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {metric.label}
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-inner text-slate-700">
                    <metric.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-7">
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              عن الجمعية
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              الجمعية التونسية للنهوض بالصحة النفسية – فرع جمال، تعمل على دعم
              الأطفال ذوي طيف التوحد والفئات الهشة من خلال برنامج تربوي وعلاجي
              مبني على مشروع تربوي فردي لكل طفل، ومقاربة تشاركية مع الأسرة
              والمؤسسات الصحية والتربوية.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>• تشخيص أولي ووضع خطة تدخل فردية (PEI).</li>
              <li>• مرافقة يومية داخل المركز وأنشطة إدماجية.</li>
              <li>• مرافقة وتكوين للأولياء حول التعامل مع الطفل.</li>
              <li>• حملات توعوية لتعزيز ثقافة الصحة النفسية والدمج.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7 shadow-xl">
            <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-2">
              مركز الحمّام لأطفال التوحد بجمال
            </p>
            <p className="text-sm sm:text-base text-slate-100/90 leading-relaxed">
              في هذا الفضاء، يعمل فريق من الأخصائيين في التربية الخاصة، علم
              النفس والعلاج الوظيفي على خلق مسار آمن، دافئ ومهيكل لكل طفل، مع
              متابعة دقيقة لمؤشرات التقدّم.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:text-sm text-slate-100/90">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[0.7rem] text-slate-100/70">العنوان</p>
                <p className="mt-1 font-semibold">
                  نهج الطاهر الحداد، حي الاستقلال 5020 جمال
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[0.7rem] text-slate-100/70">الهيكلة</p>
                <p className="mt-1 font-semibold">
                  تحت إشراف وزارة الشؤون الاجتماعية – المنستير
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG / NEWS */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800">آخر الأخبار</h2>
              <p className="mt-1 text-sm text-slate-500">
                مستجدات التظاهرات، الأيام المفتوحة، وأنشطة المركز.
              </p>
            </div>
            <Link
              to="/news"
              className="self-start text-xs sm:text-sm text-indigo-600 hover:text-indigo-500"
            >
              عرض كل الأخبار
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((post) => (
              <article
                key={post}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:shadow-md transition"
              >
                <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-200 to-sky-200 mb-4" />
                <div className="flex items-center justify-between text-[0.7rem] text-slate-500 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">
                    خبر
                  </span>
                  <span>2025-03-12</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700">
                  عنوان الخبر رقم {post}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  وصف مختصر لمحتوى الخبر يظهر هنا بشكل جذاب ومختصر عن نشاط أو
                  تظاهرة نظمتها الجمعية.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-900 text-white p-7 lg:col-span-1 shadow-xl">
            <h2 className="text-2xl font-bold mb-3">تواصل معنا</h2>
            <p className="text-sm text-slate-100/85 leading-relaxed mb-4">
              يسعدنا استقبال استفساراتكم، اقتراحاتكم أو طلبات التسجيل. فريق
              الجمعية سيتواصل معكم في أقرب الآجال.
            </p>

            <div className="space-y-3 text-sm text-slate-100/90">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-1 h-4 w-4 text-cyan-300" />
                <p>
                  نهج الطاهر الحداد، حي الاستقلال
                  <br />
                  5020 جمال، ولاية المنستير
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="h-4 w-4 text-cyan-300" />
                <p>73 487 841</p>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="h-4 w-4 text-cyan-300" />
                <p>lescolombesjammel@outlook.fr</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              أوقات العمل: الاثنين إلى الجمعة – من 8:00 إلى 16:00
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-7 lg:col-span-2">
            <form className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                />
              </div>
              <textarea
                placeholder="رسالتك"
                rows={4}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              />
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>
      </section>
    </Box>
  );
};

export default Header;
