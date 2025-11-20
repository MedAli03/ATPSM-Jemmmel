import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHeart,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUsers,
} from "react-icons/fi";
import { useSiteOverview } from "../hooks/useSiteOverview";

const FALLBACK_ABOUT = {
  heading: "نصنع الفارق مع أطفال طيف التوحد وأسرهم",
  intro:
    "منذ تأسيس الجمعية ونحن نوحّد جهود المختصين والمتطوعين لرسم مسار تعليمي وعلاجي إنساني يرتكز على احترام خصوصية كل طفل.",
  story:
    "نرافق العائلات منذ اللحظة الأولى للتشخيص بتقييمات دقيقة، خطط فردية، ومتابعة متعددة التخصصات تعزز ثقة الأسرة والطفل في رحلتهما.",
  highlights: [
    {
      id: "family",
      title: "شراكة مع العائلات",
      description: "لقاءات دورية، مجموعات دعم، واستشارات فردية تبقي الأسرة محور الاهتمام.",
    },
    {
      id: "programs",
      title: "برامج علاجية متكاملة",
      description: "فرق متخصصة في العلاج الوظيفي والنطق والتربية الخاصة بتكامل مع المدرسة.",
    },
    {
      id: "community",
      title: "مجتمع داعم وفعّال",
      description: "شبكة متطوعين وخبراء تبني مبادرات توعوية وورشات دمج على مدار العام.",
    },
  ],
  pillars: [
    {
      id: "vision",
      title: "الرؤية",
      points: [
        "مجتمع تونسي يحتضن جميع الأطفال دون استثناء",
        "حضور وطني للبرامج النوعية الموجهة لطيف التوحد",
      ],
    },
    {
      id: "mission",
      title: "الرسالة",
      points: [
        "تمكين الطفل من مهارات الاستقلال والتواصل",
        "تأهيل الأسرة بالأدوات العملية والدعم النفسي",
        "العمل مع الشركاء لتسهيل الاندماج المدرسي والمجتمعي",
      ],
    },
    {
      id: "values",
      title: "قيمنا",
      points: [
        "التعاطف والاحترام",
        "الابتكار والاستناد للأدلة العلمية",
        "الشفافية والعمل المشترك",
      ],
    },
  ],
};

const FALLBACK_CONTACT = {
  address: "حي الزياتين، الجمّال - ولاية المنستير، تونس",
  phone: "+216 73 000 000",
  email: "contact@hamaim.tn",
  hours: "الاثنين - الجمعة: 8:30 - 17:00",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn",
};

const HIGHLIGHT_ICONS = {
  family: FiHeart,
  programs: FiUsers,
  community: FiHome,
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const AssociationPage = () => {
  const { data, isLoading } = useSiteOverview();
  const about = data?.about ?? FALLBACK_ABOUT;
  const contact = data?.contact ?? FALLBACK_CONTACT;

  const highlights = useMemo(() => {
    if (Array.isArray(about.highlights) && about.highlights.length) {
      return about.highlights;
    }
    return FALLBACK_ABOUT.highlights;
  }, [about.highlights]);

  const pillars = useMemo(() => {
    if (Array.isArray(about.pillars) && about.pillars.length) {
      return about.pillars;
    }
    return FALLBACK_ABOUT.pillars;
  }, [about.pillars]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="rounded-3xl bg-gradient-to-l from-indigo-600 via-indigo-500 to-sky-400 p-8 text-white shadow-xl"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold text-white/80">عن الجمعية</p>
          <h1 className="mt-3 text-3xl font-black leading-relaxed sm:text-4xl">
            {about.heading}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90">
            {about.intro}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
            <FiArrowLeft className="h-4 w-4" />
            نرافق الأسرة والطفل بخطط فردية
          </div>
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <motion.div
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-slate-900">أبرز ما يميزنا</h2>
              <p className="mt-2 text-sm text-slate-600">
                نعمل بتكامل بين التقييم، البرامج العلاجية، والتواصل المستمر مع الأسرة لضمان تطور الطفل.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {highlights.map((item, index) => {
                  const Icon = HIGHLIGHT_ICONS[item.id] || FiHeart;
                  return (
                    <motion.div
                      key={item.id || item.title || index}
                      className="flex items-start justify-end gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      transition={{ duration: 0.4, delay: 0.15 * index }}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-slate-900">قصتنا اليومية</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">{about.story}</p>
            </motion.div>
          </div>

          <motion.div
            className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">مرتكزات العمل</h2>
              {isLoading && <span className="text-xs text-slate-400">جاري التحديث...</span>}
            </div>
            <div className="space-y-4">
              {pillars.map((pillar) => (
                <div key={pillar.id || pillar.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">{pillar.title}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {Array.isArray(pillar.points) &&
                      pillar.points.map((point, index) => (
                        <li key={`${pillar.id || pillar.title}-${index}`} className="flex items-start justify-end gap-2">
                          <FiCheckCircle className="mt-1 h-4 w-4 text-indigo-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 grid gap-6 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 text-right text-slate-900 shadow-md lg:grid-cols-[1.1fr,0.9fr]"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">تواصل معنا</h2>
            <p className="text-sm text-slate-700">سنكون سعداء بالإجابة عن أسئلتكم حول البرامج أو فرص التعاون.</p>
            <div className="space-y-3 text-sm text-slate-800">
              <div className="flex items-start justify-end gap-3">
                <div>
                  <p className="font-semibold">العنوان</p>
                  <p>{contact.address}</p>
                </div>
                <FiMapPin className="mt-1 h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex items-start justify-end gap-3">
                <div>
                  <p className="font-semibold">الهاتف</p>
                  <p>{contact.phone}</p>
                </div>
                <FiPhone className="mt-1 h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex items-start justify-end gap-3">
                <div>
                  <p className="font-semibold">البريد الإلكتروني</p>
                  <a href={`mailto:${contact.email}`} className="text-indigo-700 transition hover:text-indigo-900">
                    {contact.email}
                  </a>
                </div>
                <FiMail className="mt-1 h-5 w-5 text-indigo-600" />
              </div>
              {contact.hours && (
                <div className="flex items-start justify-end gap-3">
                  <div>
                    <p className="font-semibold">ساعات العمل</p>
                    <p>{contact.hours}</p>
                  </div>
                  <FiUsers className="mt-1 h-5 w-5 text-indigo-600" />
                </div>
              )}
            </div>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
            >
              احجز موعدًا استشاريًا
              <FiArrowLeft className="h-4 w-4" />
            </a>
          </div>

          {contact.mapEmbed && (
            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow">
              <iframe
                title="موقع الجمعية"
                src={contact.mapEmbed}
                className="h-full min-h-[260px] w-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssociationPage;
