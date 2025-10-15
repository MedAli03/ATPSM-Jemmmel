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
const ApiError = require("../utils/api-error");

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

const FALLBACK_ABOUT = {
  heading: "نصنع الفارق مع أطفال طيف التوحد وأسرهم",
  intro:
    "منذ تأسيس الجمعية ونحن نوحّد جهود المختصين والمتطوعين لرسم مسار تعليمي وعلاجي إنساني يرتكز على احترام خصوصية كل طفل.",
  story:
    "نواكب العائلات منذ اللحظة الأولى للتشخيص بتقييمات دقيقة، خطط فردية، ومتابعة متعددة التخصصات تعزز ثقة الأسرة والطفل في رحلتهما.",
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
  cta: { label: "اكتشف خدماتنا", href: "/services/education" },
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

function estimateReadTime(value) {
  if (!value) return null;
  const text = stripHtml(value);
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return Math.max(1, Math.round(words / 180));
}

function mapNewsSummary(item) {
  if (!item) return null;
  const plain = item.toJSON ? item.toJSON() : item;
  const contentSource =
    plain.contenu_html || plain.contenu || plain.resume || "";

  const summary =
    plain.resume ||
    stripHtml(contentSource)
      .slice(0, 200)
      .trim();

  return {
    id: plain.id,
    title: plain.titre,
    summary: summary,
    coverUrl: absoluteUrl(plain.couverture_url),
    publishedAt: plain.publie_le || null,
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    pinned: !!plain.epingle,
    readTimeMinutes: estimateReadTime(contentSource),
    author: plain.admin
      ? {
          id: plain.admin.id,
          name: [plain.admin.prenom, plain.admin.nom]
            .filter(Boolean)
            .join(" ")
            .trim() || null,
          email: plain.admin.email || null,
        }
      : null,
  };
}

function mapNewsDetail(item) {
  const summary = mapNewsSummary(item);
  if (!summary) return null;

  const plain = item.toJSON ? item.toJSON() : item;
  const htmlContent = plain.contenu_html || plain.contenu || "";

  return {
    ...summary,
    contentHtml: htmlContent,
    contentText: stripHtml(htmlContent),
    gallery: Array.isArray(plain.galerie_urls)
      ? plain.galerie_urls.map(absoluteUrl)
      : [],
  };
}

function mapEventForSite(event) {
  if (!event) return null;
  const plain = event.toJSON ? event.toJSON() : event;
  const startsAt = plain.debut ? new Date(plain.debut) : null;
  const endsAt = plain.fin ? new Date(plain.fin) : null;

  const durationMinutes =
    startsAt && endsAt
      ? Math.max(0, Math.round((endsAt.getTime() - startsAt.getTime()) / 60000))
      : null;

  return {
    id: plain.id,
    title: plain.titre,
    description: plain.description || null,
    startsAt: startsAt ? startsAt.toISOString() : null,
    endsAt: endsAt ? endsAt.toISOString() : null,
    location: plain.lieu || null,
    audience: plain.audience || "tous",
    status:
      startsAt && startsAt.getTime() >= Date.now() ? "upcoming" : "past",
    durationMinutes,
    attachments: plain.document
      ? {
          id: plain.document.id,
          title: plain.document.titre,
          url: absoluteUrl(plain.document.url),
          type: plain.document.type,
        }
      : null,
    host: plain.admin
      ? {
          id: plain.admin.id,
          name: [plain.admin.prenom, plain.admin.nom]
            .filter(Boolean)
            .join(" ")
            .trim() || null,
          email: plain.admin.email || null,
        }
      : null,
  };
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
  try {
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[site] Unable to fetch latest news: ${err?.message || err}`);
    }
    return FALLBACK_HERO_SLIDES.slice(0, limit).map((slide) => ({
      id: slide.id,
      titre: slide.title,
      resume: slide.subtitle,
      couverture_url: slide.image,
      publie_le: null,
      href: slide.ctaPrimary?.href || "/news",
    }));
  }
}

async function getUpcomingEvents(limit = 4) {
  try {
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[site] Unable to fetch upcoming events: ${err?.message || err}`);
    }
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
}

function toActualiteLike(item, index) {
  if (!item) return null;
  return {
    id: item.id ?? `fallback-news-${index}`,
    titre: item.titre,
    resume: item.resume,
    contenu: item.resume,
    contenu_html: item.resume,
    publie_le: item.publie_le || null,
    tags: item.tags || [],
    couverture_url: item.couverture_url || null,
    galerie_urls: item.galerie_urls || [],
    epingle: item.pinned || false,
    admin: item.admin || null,
  };
}

function toEventLike(item, index) {
  if (!item) return null;
  return {
    id: item.id ?? `fallback-event-${index}`,
    titre: item.titre,
    description: item.description || null,
    debut: item.debut || null,
    fin: item.fin || null,
    lieu: item.lieu || null,
    audience: item.audience || "tous",
    document: item.document || null,
    admin: item.admin || null,
  };
}

exports.listNews = async ({ page = 1, limit = 9, search } = {}) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const desiredLimit = Number(limit);
  const safeLimit =
    Number.isFinite(desiredLimit) && desiredLimit > 0
      ? Math.min(desiredLimit, 24)
      : 9;

  try {
    const result = await actualitesService.list({
      page: safePage,
      limit: safeLimit,
      status: "published",
      search,
    });

    const items = result.items.map(mapNewsSummary).filter(Boolean);

    if (items.length) {
      return {
        items,
        meta: {
          page: result.page || safePage,
          limit: result.limit || safeLimit,
          total: result.total ?? items.length,
        },
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[site] Unable to list news: ${err?.message || err}`);
    }
  }

  const fallback = await getLatestNews(safeLimit);
  return {
    items: fallback
      .map((item, index) => toActualiteLike(item, index))
      .map(mapNewsSummary)
      .filter(Boolean),
    meta: { page: 1, limit: safeLimit, total: fallback.length },
  };
};

exports.getNewsArticle = async (id) => {
  const article = await actualitesService.get(id);
  const isPublished =
    article?.statut === "published" ||
    (article?.publie_le && new Date(article.publie_le).getTime() <= Date.now());

  if (!isPublished) {
    throw new ApiError({
      status: 404,
      code: "NEWS_NOT_AVAILABLE",
      message: "الخبر غير متاح للعرض",
    });
  }

  return mapNewsDetail(article);
};

exports.listEvents = async ({
  page = 1,
  limit = 6,
  audience,
  search,
  from,
  to,
} = {}) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const desiredLimit = Number(limit);
  const safeLimit =
    Number.isFinite(desiredLimit) && desiredLimit > 0
      ? Math.min(desiredLimit, 24)
      : 6;

  const filters = {};
  if (audience && ["parents", "educateurs", "tous"].includes(audience)) {
    filters.audience = audience;
  }
  if (search) {
    filters.q = search;
  }
  if (from) {
    filters.date_debut = from;
  }
  if (to) {
    filters.date_fin = to;
  }

  try {
    const result = await evenementsRepo.list(filters, {
      page: safePage,
      limit: safeLimit,
    });

    const items = result.rows
      .map(mapEventForSite)
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
        const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
        return aTime - bTime;
      });

    if (items.length) {
      return {
        items,
        meta: {
          page: result.page || safePage,
          limit: result.limit || safeLimit,
          total: result.count ?? items.length,
        },
      };
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[site] Unable to list events: ${err?.message || err}`);
    }
  }

  const fallback = await getUpcomingEvents(safeLimit);
  return {
    items: fallback
      .map((item, index) => toEventLike(item, index))
      .map(mapEventForSite)
      .filter(Boolean),
    meta: { page: 1, limit: safeLimit, total: fallback.length },
  };
};

exports.getEvent = async (id) => {
  const event = await evenementsRepo.findById(id);
  if (!event) {
    throw new ApiError({
      status: 404,
      code: "EVENT_NOT_FOUND",
      message: "الفعالية غير موجودة",
    });
  }

  return mapEventForSite(event);
};

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

exports.getAbout = async () => ({ ...FALLBACK_ABOUT });

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
  const [navigation, hero, highlights, footer, contact, about] = await Promise.all([
    exports.getNavigation(),
    exports.getHero(),
    exports.getHighlights(),
    exports.getFooter(),
    exports.getContact(),
    exports.getAbout(),
  ]);

  return { navigation, hero, highlights, footer, contact, about };
};
