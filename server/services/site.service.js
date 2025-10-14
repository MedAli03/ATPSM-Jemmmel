"use strict";

const { Op } = require("sequelize");
const {
  Utilisateur,
  Enfant,
  Groupe,
  Evenement,
  Actualite,
} = require("../models");
const actualitesService = require("./actualites.service");
const evenementsRepo = require("../repos/evenements.repo");

const FALLBACK_NAVIGATION = {
  logo: {
    src: "/logo.jpg",
    alt: "شعار جمعية الحمائم",
    title: "جمعية الحمائم للنهوض بالصحة النفسية",
  },
  primary: [
    { label: "الرئيسية", href: "/" },
    { label: "عن الجمعية", href: "/about" },
    {
      label: "عن التوحد",
      children: [
        { label: "ما هو التوحد؟", href: "/what-is-autism" },
        { label: "الأسئلة الشائعة", href: "/faqs" },
      ],
    },
    {
      label: "خدماتنا",
      children: [
        { label: "البرامج التعليمية", href: "/services/education" },
        { label: "الجلسات العلاجية", href: "/services/therapy" },
        { label: "الدعم الأسري", href: "/services/support" },
      ],
    },
    { label: "الأخبار", href: "/news" },
    { label: "الفعاليات", href: "/events" },
  ],
  cta: { label: "تواصل معنا", href: "/contact" },
};

const FALLBACK_FOOTER = {
  about: {
    title: "جمعية الحمائم",
    description:
      "نعمل على تمكين الأطفال ذوي طيف التوحد وأسرهم من خلال برامج علاجية وتربوية متخصصة تدعم الدمج في المجتمع.",
  },
  contact: {
    address: "حي الزياتين، الجمّال - ولاية المنستير، تونس",
    phone: "+216 73 000 000",
    email: "contact@hamaim.tn",
    hours: "الاثنين - الجمعة: 8:30 - 17:00",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1644.9784642295117!2d10.760607824637864!3d35.615385065890756!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13020f849bdd6ebf%3A0xd864a3f1a3a38882!2zSlE4Nis4Q0osINi32LHZitmCINin2YTYqtmK2KfZitix2KksIEplbW1lbA!5e1!3m2!1sfr!2stn!4v1742081263237!5m2!1sfr!2stn",
  },
  columns: [
    {
      title: "روابط سريعة",
      links: [
        { label: "عن الجمعية", href: "/about" },
        { label: "البرامج", href: "/services/education" },
        { label: "انضم إلينا", href: "/contact" },
      ],
    },
    {
      title: "موارد للعائلات",
      links: [
        { label: "ما هو التوحد؟", href: "/what-is-autism" },
        { label: "الأسئلة الشائعة", href: "/faqs" },
        { label: "أحدث الأخبار", href: "/news" },
      ],
    },
  ],
  social: [
    { platform: "facebook", url: "https://www.facebook.com/profile.php?id=100064660632943" },
    { platform: "instagram", url: "https://www.instagram.com" },
    { platform: "youtube", url: "https://www.youtube.com" },
    { platform: "email", url: "mailto:contact@hamaim.tn" },
  ],
  newsletter: {
    title: "النشرة البريدية",
    description: "اشترك ليصلك جديد برامجنا وفعالياتنا",
    placeholder: "أدخل بريدك الإلكتروني",
    button: "اشتراك",
  },
  copyright:
    "© " + new Date().getFullYear() + " جمعية الحمائم للنهوض بالصحة النفسية. جميع الحقوق محفوظة.",
};

const FALLBACK_HERO_SLIDES = [
  {
    id: "vision",
    title: "نحو مستقبل أكثر إشراقًا لأطفال طيف التوحد",
    subtitle: "نرافق الأسر بخطط فردية تدعم التعلم والتواصل والاستقلالية",
    image: "/aut1.jpg",
    ctaPrimary: { label: "تعرف على خدماتنا", href: "/services/education" },
    ctaSecondary: { label: "تواصل مع فريقنا", href: "/contact" },
  },
  {
    id: "programs",
    title: "برامج علاجية متخصصة تقودها كفاءات وطنية",
    subtitle: "جلسات علاج وظيفي ونطق تدعم تطور الطفل داخل بيئة آمنة ومحبة",
    image: "/aut2.jpg",
    ctaPrimary: { label: "استكشف البرامج", href: "/services/therapy" },
    ctaSecondary: { label: "قصص نجاح", href: "/news" },
  },
  {
    id: "families",
    title: "شراكة حقيقية مع الأسرة من أول خطوة",
    subtitle: "ورش عمل وإرشاد أسري يضع احتياجات الوالدين في قلب الاهتمام",
    image: "/aut3.jpg",
    ctaPrimary: { label: "مواعيد الاستشارات", href: "/contact" },
    ctaSecondary: { label: "الأسئلة الشائعة", href: "/faqs" },
  },
];

function stripHtml(value) {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
}

async function getHeroSlides() {
  const pinned = await actualitesService.list({
    status: "published",
    limit: 5,
    page: 1,
    pinnedOnly: true,
  });

  const published = pinned.items.length
    ? pinned.items
    : (
        await actualitesService.list({
          status: "published",
          limit: 5,
          page: 1,
        })
      ).items;

  if (!published.length) return FALLBACK_HERO_SLIDES;

  return published.map((item, index) => ({
    id: item.id,
    title: item.titre,
    subtitle: item.resume || stripHtml(item.contenu).slice(0, 180),
    image: absoluteUrl(item.couverture_url) || FALLBACK_HERO_SLIDES[index % FALLBACK_HERO_SLIDES.length].image,
    publishedAt: item.publie_le,
    ctaPrimary: { label: "اقرأ المزيد", href: `/news/${item.id}` },
    ctaSecondary: FALLBACK_HERO_SLIDES[index % FALLBACK_HERO_SLIDES.length].ctaSecondary,
  }));
}

async function getLatestNews(limit = 3) {
  const result = await actualitesService.list({
    status: "published",
    limit,
    page: 1,
  });

  if (!result.items.length) {
    return FALLBACK_HERO_SLIDES.slice(0, limit).map((slide) => ({
      id: slide.id,
      titre: slide.title,
      resume: slide.subtitle,
      couverture_url: slide.image,
      publie_le: null,
      href: slide.ctaPrimary?.href || "/news",
    }));
  }

  return result.items.map((item) => ({
    id: item.id,
    titre: item.titre,
    resume: item.resume || stripHtml(item.contenu).slice(0, 160),
    couverture_url: absoluteUrl(item.couverture_url),
    publie_le: item.publie_le,
    href: `/news/${item.id}`,
    tags: Array.isArray(item.tags) ? item.tags : [],
    pinned: !!item.epingle,
  }));
}

async function getUpcomingEvents(limit = 4) {
  const rows = await evenementsRepo.listUpcoming({ limit });
  if (!rows.length) {
    return [
      {
        id: "atelier-familles",
        titre: "ورشة دعم للأولياء",
        debut: null,
        fin: null,
        lieu: "مقر الجمعية",
        audience: "tous",
        description: "جلسة مفتوحة لمناقشة تحديات الدمج المدرسي وتبادل الخبرات.",
      },
    ];
  }

  return rows.map((event) => ({
    id: event.id,
    titre: event.titre,
    debut: event.debut,
    fin: event.fin,
    lieu: event.lieu,
    audience: event.audience,
    description: event.description || null,
  }));
}

async function getHeadlineStats() {
  const [children, educators, parents, activeGroups, totalEvents, totalNews] =
    await Promise.all([
      Enfant.count(),
      Utilisateur.count({ where: { role: "EDUCATEUR", is_active: true } }),
      Utilisateur.count({ where: { role: "PARENT", is_active: true } }),
      Groupe.count({ where: { statut: { [Op.ne]: "archive" } } }).catch(() =>
        Groupe.count().catch(() => 0)
      ),
      Evenement.count().catch(() => 0),
      Actualite.count().catch(() => 0),
    ]);

  return {
    children,
    educators,
    parents,
    activeGroups,
    events: totalEvents,
    news: totalNews,
  };
}

exports.getNavigation = async () => ({ ...FALLBACK_NAVIGATION });

exports.getFooter = async () => ({ ...FALLBACK_FOOTER });

exports.getHero = async () => ({ slides: await getHeroSlides() });

exports.getHighlights = async () => ({
  news: await getLatestNews(),
  events: await getUpcomingEvents(),
  stats: await getHeadlineStats(),
});

exports.getContact = async () => ({
  ...FALLBACK_FOOTER.contact,
  social: FALLBACK_FOOTER.social,
});

exports.getOverview = async () => {
  const [navigation, hero, highlights, footer, contact] = await Promise.all([
    exports.getNavigation(),
    exports.getHero(),
    exports.getHighlights(),
    exports.getFooter(),
    exports.getContact(),
  ]);

  return { navigation, hero, highlights, footer, contact };
};
