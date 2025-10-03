import React, { useState, useEffect } from "react";
import InstaEmbed from "./components/InstaEmbed";

// TODO: вставь свою live-ссылку Stripe
const STRIPE_URL = "https://buy.stripe.com/xxxxx-live-link";

/** публичные рилсы; важен завершающий слэш */
const INSTAGRAM_REELS: string[] = [
  "https://www.instagram.com/reel/DJjUiEnM-A_/",
  "https://www.instagram.com/reel/DJSHB73ogs1/",
  "https://www.instagram.com/reel/DJmUkiNsZe1/",
  "https://www.instagram.com/reel/DJoAXfKs6tu/",
  "https://www.instagram.com/reel/DFX57cQobmS/"
];

// Простой таймер «ограниченного времени» (~12 часов)
function useCountdown(hours = 12) {
  const [end] = useState(() => Date.now() + hours * 3600 * 1000);
  const [left, setLeft] = useState(end - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(id);
  }, [end]);
  const total = Math.max(0, left);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { h, m, s, finished: total <= 0 };
}

// Мини-маркер секции (цифра + тонкая линия слева на десктопе)
function SectionMarker({ n }: { n: string }) {
  return (
    <div className="hidden lg:block section-marker" aria-hidden="true">
      <span className="marker-number">{n}</span>
      <span className="marker-line" />
      <style jsx>{`
        .section-marker {
          position: absolute;
          left: 0;
          top: 0.25rem;
          transform: translateX(-56px);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .marker-number {
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #64748b; /* slate-500 */
        }
        .marker-line {
          display: inline-block;
          width: 42px;
          height: 1px;
          background: #e5e7eb; /* gray-200 */
        }
      `}</style>
    </div>
  );
}

// Лайтбокс для отзывов
function ReviewLightbox({
  isOpen,
  onClose,
  imageSrc,
  reviewNumber
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  reviewNumber: number;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-2xl max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <img
          src={imageSrc}
          alt={`Отзыв ${reviewNumber}`}
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

// Полоска прогресса прокрутки
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-gray-900 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

// Подсветка ключевых фраз внутри описаний
function HighlightedDesc({
  text,
  primaryHighlight,
  extraPhrases = []
}: {
  text: string;
  primaryHighlight?: string;
  extraPhrases?: string[];
}) {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = escapeHtml(text);
  const apply = (phrase: string) => {
    const p = escapeHtml(phrase);
    html = html.replace(
      new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      `<span class="text-gray-900 font-semibold">${p}</span>`
    );
  };
  if (primaryHighlight) apply(primaryHighlight);
  for (const phrase of extraPhrases) apply(phrase);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewersCount, setViewersCount] = useState(9);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const { h, m, s, finished } = useCountdown(12);

  // Лёгкий счётчик «онлайн»
  useEffect(() => {
    const id = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const n = prev + change;
        return Math.max(4, Math.min(18, n));
      });
    }, 12000 + Math.random() * 8000);
    return () => clearInterval(id);
  }, []);

  const openLightbox = (imageSrc: string, reviewNumber: number) => {
    setLightboxImage(imageSrc);
    setLightboxReviewNumber(reviewNumber);
    setLightboxOpen(true);
  };

  // Анимация заголовков (мобайл включительно)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("head-in");
        });
      },
      { threshold: 0.3 }
    );
    document
      .querySelectorAll<HTMLElement>(".js-heading")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Lightbox */}
      <ReviewLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={lightboxImage}
        reviewNumber={lightboxReviewNumber}
      />

      {/* Progress */}
      <ScrollProgress />

      {/* Floating online counter — десктоп */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/90 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">{viewersCount} онлайн</span>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900">Beauty Scripts</div>
          <div className="flex items-center gap-4">
            <a
              href={STRIPE_URL}
              target="_blank"
              rel="noopener"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all hover:scale-105 transform hover:shadow-lg"
            >
              Купить
            </a>
          </div>
        </div>
      </header>

      {/* HERO (главный экран): фото не закрывает глаза */}
      <section className="relative min-h-[88vh] flex items-center pt-24 hero-bg">
        {/* Подложка на мобиле для читабельности текста */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-white/70 via-white/40 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="js-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-5 text-gray-900">
              Скрипты, которые превращают{" "}
              <span className="text-gray-900 border-b border-gray-300">
                сообщения в деньги
              </span>
            </h1>

            {/* Подзаголовок «Результат…» — премиально, типографика */}
            <div className="result-subtitle js-heading">
              <div className="rule" />
              <p>
                <span className="label">Результат</span>
                <span className="sep">:</span>
                <span className="pill">закрытые возражения</span>
                <span className="dot">·</span>
                <span className="pill pill-2">увеличенный средний чек</span>
                <span className="dot">·</span>
                <span className="pill pill-3">экономия времени</span>
              </p>
            </div>

            <p className="text-[17px] text-gray-800 mb-8 leading-relaxed">
              Проверенная система общения с клиентами для бьюти-мастеров.
            </p>

            <div className="flex items-center gap-4">
              <a
                href={STRIPE_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 px-7 py-4 bg-gray-900 text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Купить <span className="inline-block ml-1">→</span>
              </a>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-black text-white rounded">Apple Pay</span>
                <span className="px-2 py-1 bg-gray-800 text-white rounded">Google Pay</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-bg {
            background-image: url('/images/IMG_6243.png'); /* поставь свою картинку */
            background-size: cover;
            background-position: center; /* мобайл — по центру (глаза не перекрываем) */
          }
          @media (min-width: 1024px) {
            .hero-bg { background-position: right center; } /* десктоп — смещаем вправо */
          }

          .result-subtitle { margin: 10px 0 16px; }
          .result-subtitle .rule {
            height: 1px; background: #e5e7eb; margin-bottom: 8px;
          }
          .result-subtitle p {
            display: flex; flex-wrap: wrap; gap: 8px;
            align-items: baseline; color: #0f172a; /* slate-900 */
          }
          .result-subtitle .label {
            font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
            font-size: 12px; color: #111827; /* gray-900 */
          }
          .result-subtitle .sep { opacity: .6; }
          .result-subtitle .pill {
            padding: 2px 8px; border-radius: 999px; font-weight: 600;
            background: #f3f4f6; /* gray-100 */
          }
          .result-subtitle .pill-2 { background: #eef7f1; /* зелёно-пудровое */ }
          .result-subtitle .pill-3 { background: #f6f2f2; /* бордово-пудровое очень светлое */ }
          .result-subtitle .dot { opacity:.5; margin: 0 2px; }
        `}</style>
      </section>

      {/* 01 — Сравнение */}
      <section id="comparison" className="relative py-20 bg-gray-50">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-2">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">
              Как изменится ваша <span className="text-gray-900">работа с клиентами</span>
            </h2>
            <p className="mt-3 text-gray-600 reveal-up" style={{ animationDelay: "120ms" }}>
              Сравните результаты до и после внедрения скриптов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
            {/* Сейчас */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-50 text-rose-700 rounded-full font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Сейчас
                </div>
              </div>
              <ul className="space-y-3 text-gray-800 text-[15px]">
                {[
                  "«Сколько стоит?» → Отвечаете только ценой и тишина.",
                  "«Подумаю» → Не знаете, что ответить: клиент уходит.",
                  "«Переписка 30+ минут» → Клиент остывает, теряете заявку.",
                  "«10 заявок» → Долгие диалоги приводят только к 2–3 записям."
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mt-0.5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* После */}
            <div className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up" style={{ animationDelay: "120ms" }}>
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  После
                </div>
              </div>
              <ul className="space-y-3 text-gray-800 text-[15px]">
                {[
                  "«Сколько стоит?» → Презентуете ценность, получаете запись.",
                  "«Подумаю» → Мягкое возражение возвращает к записи.",
                  "«Переписка 5 минут» → Готовые фразы ведут к быстрой записи.",
                  "«10 заявок» → Чёткие диалоги дают 6–7 записей."
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mt-0.5 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Почему это важно */}
      <section id="why" className="relative py-20 bg-white">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">
              Почему это <span className="text-gray-900">важно</span>
            </h2>
            <p className="mt-3 text-gray-600 reveal-up" style={{ animationDelay: "120ms" }}>
              Каждая потерянная заявка — это упущенная прибыль
            </p>
          </div>

          {/* компактные карточки */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-12">
            {[
              {
                img: "/images/money.png",
                title: "Сливаются деньги на рекламу",
                text: "Платите за заявки, но конвертируете лишь 20–30%."
              },
              {
                img: "/images/clock.png",
                title: "Тратится время впустую",
                text: "По 30–40 минут переписки — 3–4 часа в день."
              },
              {
                img: "/images/door.png",
                title: "Заявки уходят к конкуренту",
                text: "Быстрые и уверенные ответы забирают клиента."
              }
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img
                  src={c.img}
                  alt=""
                  className="mx-auto mb-4 w-12 h-12 object-contain"
                />
                <h3 className="font-semibold text-[16px] text-gray-900">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-gray-600 text-[14px]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — Кому подходят (рамки зелёно-пудровые, компактнее) */}
      <section id="for" className="relative py-20 bg-gray-50">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Кому подходят <span className="text-gray-900">скрипты</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {[
              {
                img: "/images/salon.png",
                title: "Салоны и студии",
                text: "Единый стандарт ответов и контроль качества."
              },
              {
                img: "/images/med.png",
                title: "Медцентры",
                text: "Админы закрывают заявки — врачи лечат."
              },
              {
                img: "/images/team.png",
                title: "Мастера-универсалы",
                text: "Уверенность в переписке и быстрая запись."
              },
              {
                img: "/images/one.png",
                title: "Узкие специалисты",
                text: "Ногти, брови, ресницы, волосы, косметология."
              }
            ].map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 reveal-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderColor: i < 4 ? "#dbe7df" : undefined // пудрово-зелёный контур
                }}
              >
                <div className="flex items-center gap-3">
                  <img src={c.img} alt="" className="w-10 h-10 object-contain" />
                  <h3 className="text-[16px] font-bold text-gray-900">{c.title}</h3>
                </div>
                <p className="mt-2 text-gray-600 text-[14px]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — Что входит */}
      <section id="whats-included" className="relative py-20 bg-white">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">
              Что входит в <span className="text-gray-900">систему скриптов</span>
            </h2>
            <p className="mt-3 text-gray-600 reveal-up" style={{ animationDelay: "120ms" }}>
              Полный набор инструментов для увеличения продаж
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              {
                img: "/images/xmind.png",
                title: "Готовые диалоги",
                desc: "Приветствия, презентация ценности, запись. Всё пошагово.",
                highlight: "презентация ценности"
              },
              {
                img: "/images/target.png",
                title: "Закрытие возражений",
                desc: "«Дорого», «Подумаю», «У другого дешевле». Мягкие ответы.",
                highlight: "Мягкие ответы"
              },
              {
                img: "/images/salons.png",
                title: "Под каждую услугу",
                desc: "Маникюр, брови, ресницы, косметология, массаж.",
                highlight: "каждую услугу"
              },
              {
                img: "/images/bucle.png",
                title: "Возврат клиентов",
                desc: "Реактивация «спящей» базы без рекламы.",
                highlight: "без рекламы"
              },
              {
                img: "/images/phone.png",
                title: "Гайд по внедрению",
                desc: "Старт за один день: план и стандарты для команды.",
                highlight: "Старт за один день"
              },
              {
                img: "/images/rocket.png",
                title: "Итог",
                desc: "Больше записей, выше средний чек, меньше времени.",
                highlight: "выше средний чек"
              }
            ].map((item, k) => (
              <div
                key={k}
                className="rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up"
                style={{ animationDelay: `${k * 80}ms` }}
              >
                <img src={item.img} alt="" className="w-10 h-10 object-contain mb-5" />
                <h3 className="text-[16px] font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1.5 text-gray-600 text-[14px]">
                  <HighlightedDesc
                    text={item.desc}
                    primaryHighlight={item.highlight}
                    extraPhrases={["без давления", "каждой ниши"]}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Бонусы (минимально, без эмодзи в заголовке) */}
      <section id="bonuses" className="relative py-20 bg-gray-50 overflow-hidden">
        <SectionMarker n="05" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-50/40 via-slate-50/40 to-rose-50/40" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">
              Бонусы при покупке
            </h2>
            <p className="mt-3 text-gray-600 reveal-up" style={{ animationDelay: "120ms" }}>
              Суммарная ценность — 79€. Сегодня идут бесплатно со скриптами
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-12">
            {[
              {
                image: "/images/bonus1.png",
                title: "Гайд «Работа с клиентской базой»",
                desc: "Повторные записи без рекламы.",
                old: "27€"
              },
              {
                image: "/images/bonus2.png",
                title: "Чек-лист «30+ источников клиентов»",
                desc: "Платные и бесплатные способы.",
                old: "32€"
              },
              {
                image: "/images/bonus3.png",
                title: "Гайд «Продажи на консультации»",
                desc: "5 этапов: мягкий апсейл.",
                old: "20€"
              }
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center bg-white shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 reveal-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-5">
                  <img
                    src={b.image}
                    alt={`Бонус ${i + 1}`}
                    className="w-28 h-36 mx-auto object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900">{b.title}</h3>
                <p className="mt-1.5 text-gray-600 text-[14px]">{b.desc}</p>
                <div className="mt-3 flex items-center justify-center gap-2 text-[15px]">
                  <span className="text-gray-400 line-through">{b.old}</span>
                  <span className="font-bold text-emerald-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — Что изменится сразу */}
      <section id="immediate" className="relative py-20 bg-white">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Что изменится сразу
          </h2>

          <div className="space-y-4 mt-10">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ."
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-gray-50 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 reveal-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-gray-800">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — Отзывы */}
      <section id="reviews" className="relative py-20 bg-gray-50">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-10">
            Отзывы клиентов
          </h2>

          {/* Фото-отзывы */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className="group cursor-pointer reveal-up rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${n * 60}ms` }}
                onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
              >
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform"
                />
              </button>
            ))}
          </div>

          {/* Reels Instagram */}
          <div className="flex gap-3 justify-center items-start mb-4 overflow-x-auto pb-2 reels-row">
            {INSTAGRAM_REELS.map((url) => (
              <div key={url} className="reel-card rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                <InstaEmbed url={url} maxWidth={240} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — Оффер / Оплата */}
      <section id="offer" className="relative py-20 bg-white">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="js-heading text-3xl lg:text-4xl font-extrabold text-gray-900">
              Полная система со скидкой 70%
            </h2>
            <p className="mt-2 text-sm text-gray-500 reveal-up" style={{ animationDelay: "120ms" }}>
              Специальное предложение на этой неделе • Ограниченное время
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-8 bg-slate-900 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] reveal-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10 text-center">
                <div className="text-sm uppercase tracking-wide text-gray-300 mb-3">
                  Полный доступ
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-gray-400 line-through text-2xl">67€</span>
                  <span className="text-5xl font-extrabold text-white">19€</span>
                </div>

                {/* Таймер */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-6 rounded-full border border-white/20 px-5 py-2">
                    {!finished ? (
                      <span className="font-bold tabular-nums text-white">
                        {String(h).padStart(2, "0")}:
                        {String(m).padStart(2, "0")}:
                        {String(s).padStart(2, "0")}
                      </span>
                    ) : (
                      <span className="font-semibold text-white">Время истекло</span>
                    )}
                    <span className="text-gray-300 text-sm">до конца предложения</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={STRIPE_URL}
                  target="_blank"
                  rel="noopener"
                  className="block w-full text-center rounded-xl bg-white text-gray-900 font-bold py-4 px-6 hover:bg-gray-100 transition-all transform hover:scale-[1.02] shadow-lg mb-4"
                  aria-label="Купить полную систему — 19 евро"
                >
                  Получить со скидкой 70%
                </a>

                <div className="text-xs text-gray-300 mb-6">
                  Без скрытых платежей • Пожизненный доступ • Обновления включены
                </div>

                {/* Что входит */}
                <div className="text-left mb-4">
                  <h3 className="text-base font-bold text-white mb-3 text-center">
                    Что входит:
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления"
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0">✓</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Способы оплаты */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div className="px-2 py-1 bg-black text-white rounded">Apple Pay</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">Google Pay</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">Visa</div>
                  <div className="px-2 py-1 bg-white/20 text-white rounded">MasterCard</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — FAQ */}
      <section id="faq" className="relative py-20 bg-white">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">
            Частые вопросы
          </h2>

          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-top border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xl font-bold text-gray-900 mb-4">Beauty Scripts</div>
          <p className="text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {/* Sticky CTA (мобилка) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 lg:hidden">
        <a
          href={STRIPE_URL}
          target="_blank"
          rel="noopener"
          className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold text-center block hover:bg-gray-800 transition-all hover:scale-[1.02]"
        >
          Готовые скрипты — 19€ • Купить
        </a>
      </div>

      {/* CSS: анимации, reels, компактные карточки */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-up { opacity: 0; animation: fade-in .8s ease-out forwards; }

        .reels-row { scroll-snap-type: x mandatory; }
        .reels-row > * { scroll-snap-align: center; }

        .reel-card { width: 180px; aspect-ratio: 9 / 16; }
        @media (min-width: 640px) { .reel-card { width: 220px; } }
        @media (min-width: 1024px) { .reel-card { width: 240px; } }

        /* Анимация заголовков — мягкая, работает и на мобиле */
        .js-heading { opacity: 0; transform: translateY(14px); transition: opacity .7s ease, transform .7s ease; }
        .js-heading.head-in { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}

// Аккордеон FAQ вынесен внизу, чтобы ничего не удалять из основного потока
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    {
      q: "Сработает в моей нише?",
      a: "Да. База универсальная и блоки под ногти/бровы/ресницы/волосы/косметологию/перманент."
    },
    {
      q: "Не будет ли звучать «по-скриптовому»?",
      a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное — следовать алгоритму."
    },
    {
      q: "Зачем это админам?",
      a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее."
    },
    {
      q: "Когда будут результаты?",
      a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи."
    }
  ];
  return (
    <div className="space-y-4 mt-10">
      {items.map((f, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300 reveal-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full px-6 py-5 text-left hover:bg-gray-100 flex justify-between items-center transition-colors"
          >
            <span className="font-semibold text-[17px] text-gray-900">{f.q}</span>
            <span
              className={`w-5 h-5 text-gray-400 transition-transform ${
                open === i ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </button>
          {open === i && (
            <div className="px-6 py-5 border-t border-gray-200">
              <p className="text-gray-700 leading-relaxed text-[15px]">{f.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
