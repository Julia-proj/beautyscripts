import React, { useState, useEffect } from "react";
import InstaEmbed from "./components/InstaEmbed";

// TODO: вставь свою ссылку Stripe
const STRIPE_URL = "https://buy.stripe.com/5kQdRb8cbglMf7E7dSdQQ00";

/** публичные рилсы; важен завершающий слэш */
const INSTAGRAM_REELS: string[] = [
  "https://www.instagram.com/reel/DJjUiEnM-A_/",
  "https://www.instagram.com/reel/DJSHB73ogs1/",
  "https://www.instagram.com/reel/DJmUkiNsZe1/",
  "https://www.instagram.com/reel/DJoAXfKs6tu/",
  "https://www.instagram.com/reel/DFX57cQobmS/"
];

// ----- таймер «ограниченного времени»
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

// ----- маркер секции: «01» + тонкая линия слева (герой не считается)
function SectionMarker({ n }: { n: string }) {
  return (
    <div className="hidden lg:block section-marker" aria-hidden="true">
      <span className="marker-number">{n}</span>
      <span className="marker-line" />
      <style jsx>{`
        .section-marker{ position:absolute; left:0; top:0.25rem; transform: translateX(-48px); display:flex; align-items:center; gap:10px; }
        .marker-number{ font-weight:700; font-size:12px; letter-spacing:.08em; color:#64748b; }
        .marker-line{ width:36px; height:1px; background:#e5e7eb; }
      `}</style>
    </div>
  );
}

// ----- лайтбокс отзывов
function ReviewLightbox({ isOpen, onClose, imageSrc, reviewNumber }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-2xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300">✕</button>
        <img src={imageSrc} alt={`Отзыв ${reviewNumber}`} className="w-full h-auto rounded-lg shadow-2xl" />
      </div>
    </div>
  );
}

// ----- полоска прогресса прокрутки
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const t = document.documentElement;
      const scrolled = (t.scrollTop / (t.scrollHeight - t.clientHeight)) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', update);
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-gray-900 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
    </div>
  );
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewersCount, setViewersCount] = useState(8);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxReviewNumber, setLightboxReviewNumber] = useState(1);
  const { h, m, s, finished } = useCountdown(12);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  // лёгкий «онлайн»-счётчик
  useEffect(() => {
    const id = setInterval(() => {
      setViewersCount(prev => Math.max(4, Math.min(15, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 12000 + Math.random() * 8000);
    return () => clearInterval(id);
  }, []);

  const openLightbox = (src: string, num: number) => {
    setLightboxImage(src); setLightboxReviewNumber(num); setLightboxOpen(true);
  };

  // анимация заголовков на скролле (включая мобилку)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("head-in"); });
    }, { threshold: 0.3 });
    document.querySelectorAll<HTMLElement>(".js-heading").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ReviewLightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} imageSrc={lightboxImage} reviewNumber={lightboxReviewNumber} />
      <ScrollProgress />

      {/* онлайн-счётчик (desktop) */}
      <div className="fixed bottom-6 left-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/90 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">{viewersCount} онлайн</span>
        </div>
      </div>

      {/* header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900">Beauty Scripts</div>
          <a href={STRIPE_URL} target="_blank" rel="noopener" className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all hover:scale-105">
            Купить
          </a>
        </div>
      </header>

      {/* ===== HERO: фото фоном, не перекрывает глаза, подзаголовок как у anyagal ===== */}
      <section className="relative min-h-[88vh] flex items-center pt-24 hero-bg">
        {/* лёгкая белая подложка на мобиле, чтобы текст не «плыл» на фото */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-white/70 via-white/40 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="js-heading text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
              Скрипты, которые превращают <span className="text-gray-900 underline-offset-4 decoration-[1.5px] decoration-gray-900/30 underline">сообщения в деньги</span>
            </h1>

            {/* подзаголовок-«overline» с тонкой линией — премиально */}
            <div className="subhead-wrap mb-8">
              <span className="subhead-label">Результат</span>
              <div className="subhead-line" />
              <p className="subhead-text">
                Закрытые возражения — увеличенный средний чек — экономия времени
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a href={STRIPE_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-3 px-7 py-4 bg-gray-900 text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                Купить <span className="inline-block ml-1">→</span>
              </a>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-black text-white rounded">Apple Pay</span>
                <span className="px-2 py-1 bg-gray-900/80 text-white rounded">Google Pay</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-bg{ background-image: url('/images/IMG_6243.png'); background-size: cover; background-position: center; }
          @media (min-width: 1024px){ .hero-bg{ background-position: right center; } } /* чтобы не закрывать глаза */
          .subhead-wrap{ display:flex; align-items:center; gap:12px; }
          .subhead-label{ font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#6b7280; }
          .subhead-line{ height:1px; flex:1; background: linear-gradient(90deg, rgba(17,24,39,.35), rgba(17,24,39,.08)); }
          .subhead-text{ margin:0; color:#0f172a; font-weight:600; }
        `}</style>
      </section>

      {/* ===== 01 — СРАВНЕНИЕ ===== */}
      <section id="comparison" className="relative py-16 md:py-20 bg-gray-50">
        <SectionMarker n="01" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-2">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">Как изменится ваша <span className="text-gray-900">работа с клиентами</span></h2>
            <p className="mt-3 text-gray-600">Сравните «сейчас» и «после»</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mt-10 md:mt-12">
            {/* СЕЙЧАС */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-50 text-rose-700 rounded-full font-medium text-sm">СЕЙЧАС</div>
              </div>
              <ul className="space-y-3 md:space-y-4 text-gray-800">
                {[
                  "«Сколько стоит?» → ответ только ценой и тишина.",
                  "«Подумаю» → не знаете, что ответить: клиент уходит.",
                  "Переписка 30+ минут → человек остывает.",
                  "10 заявок → в записи превращаются 2–3.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                    <span className="w-4 h-4 mt-1 rounded-full bg-rose-400/90"></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ПОСЛЕ */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium text-sm">ПОСЛЕ</div>
              </div>
              <ul className="space-y-3 md:space-y-4 text-gray-800">
                {[
                  "«Сколько стоит?» → презентуете ценность, получаете запись.",
                  "«Подумаю» → мягкий ответ возвращает к записи.",
                  "Переписка ~5 минут → готовые фразы ведут к цели.",
                  "10 заявок → в записи превращаются 6–7.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                    <span className="w-4 h-4 mt-1 rounded-full bg-emerald-500/90"></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 02 — ПОЧЕМУ ЭТО ВАЖНО ===== */}
      <section id="why" className="relative py-16 md:py-20 bg-white">
        <SectionMarker n="02" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">Почему это важно</h2>
            <p className="mt-3 text-gray-600">Каждая потерянная заявка — это упущенная прибыль</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-8 mt-10 md:mt-12">
            {[
              { img: "/images/money.png", title: "Сливаются деньги на рекламу", text: "Платите за заявки, но конвертируете лишь 20–30%." },
              { img: "/images/clock.png", title: "Тратится время впустую", text: "По 30–40 минут на переписку с каждым. Уходит 3–4 часа в день." },
              { img: "/images/door.png", title: "Заявки уходят к конкуренту", text: "Клиент записывается к тем, кто отвечает быстро и уверенно." },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl border p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <img src={c.img} alt="" className="mx-auto mb-5 w-14 h-14 object-contain" />
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="mt-2 text-gray-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 03 — КОМУ ПОДХОДИТ (пудрово-зелёные рамки, компакт на мобиле = 4 карточки видны) ===== */}
      <section id="for" className="relative py-16 md:py-20 bg-gray-50">
        <SectionMarker n="03" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">Кому подходят скрипты</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12 compact-grid">
            {[
              { img: "/images/salon.png", title: "Владельцам салонов", text: "Стандарт ответов, скорость и контроль." },
              { img: "/images/med.png", title: "Медцентрам", text: "Админы закрывают заявки, врачи лечат." },
              { img: "/images/team.png", title: "Мастерам-универсалам", text: "Готовые ответы ускоряют запись." },
              { img: "/images/one.png", title: "Узким специалистам", text: "Ногти, брови, ресницы, волосы, PMU." },
            ].map((c, i) => (
              <div key={i} className="card-compact border rounded-2xl p-4 md:p-6 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                   style={{ borderColor: "rgba(46,107,79,0.35)" }}>
                <div className="flex items-center gap-3">
                  <img src={c.img} alt="" className="w-9 h-9 object-contain" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">{c.title}</h3>
                </div>
                <p className="mt-2 text-sm md:text-base text-gray-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          /* компакт на мобиле — 4 карточки помещаются (2х2) без лишних отступов */
          .compact-grid{ grid-auto-rows: 1fr; }
          :global(.card-compact){ min-height: 132px; }
          @media (max-width: 639px){
            .compact-grid{ gap: 8px; }
            :global(.card-compact){ padding: 12px; }
          }
        `}</style>
      </section>

      {/* ===== 04 — ЧТО ВХОДИТ (компактнее) ===== */}
      <section id="whats-included" className="relative py-16 md:py-20 bg-white">
        <SectionMarker n="04" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">Что входит в систему скриптов</h2>
            <p className="mt-3 text-gray-600">Полный набор инструментов для увеличения продаж</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-12">
            {[
              { img: "/images/xmind.png", title: "Готовые диалоги", desc: "Приветствия, ценность, запись. Всё пошагово." },
              { img: "/images/target.png", title: "Закрытие возражений", desc: "«Дорого», «Подумаю», «У другого дешевле» — без давления." },
              { img: "/images/salons.png", title: "Под каждую услугу", desc: "Маникюр, брови, ресницы, косметология, массаж." },
              { img: "/images/bucle.png", title: "Возврат клиентов", desc: "Сценарии повторных записей и реактивации базы." },
              { img: "/images/phone.png", title: "Гайд по внедрению", desc: "Старт за один день: стандарты для команды." },
              { img: "/images/rocket.png", title: "Итог", desc: "Больше записей, выше средний чек, меньше времени." },
            ].map((item, k) => (
              <div key={k} className="rounded-2xl border p-4 md:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <img src={item.img} alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain mb-4 md:mb-6" />
                <h3 className="text-base md:text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 05 — БОНУСЫ ===== */}
      <section id="bonuses" className="relative py-16 md:py-20 bg-gray-50 overflow-hidden">
        <SectionMarker n="05" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#f5f7f4] via-[#f7f5f6] to-[#f5f5fb]" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center">
            <h2 className="js-heading text-3xl lg:text-4xl font-bold text-gray-900">Бонусы при покупке</h2>
            <p className="mt-3 text-gray-600">Суммарная ценность — 79€. Сегодня идут бесплатно со скриптами</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-8 mt-10 md:mt-12">
            {[
              { image: "/images/bonus1.png", title: "Гайд «Работа с клиентской базой»", desc: "Возвращайте старых клиентов без рекламы.", old: "27€" },
              { image: "/images/bonus2.png", title: "Чек-лист «30+ источников клиентов»", desc: "Где взять заявки уже сегодня.", old: "32€" },
              { image: "/images/bonus3.png", title: "Гайд «Продажи на консультации»", desc: "5 этапов продаж и мягкий апсейл.", old: "20€" },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl p-6 md:p-8 text-center bg-white shadow-sm border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <img src={b.image} alt="" className="w-28 h-36 md:w-32 md:h-40 mx-auto object-cover rounded-lg mb-4 md:mb-6" />
                <h3 className="text-base md:text-lg font-bold text-gray-900">{b.title}</h3>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">{b.desc}</p>
                <div className="mt-3 md:mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm md:text-lg font-bold text-gray-400 line-through">{b.old}</span>
                  <span className="text-base md:text-xl font-bold text-green-600">0€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 06 — ЧТО ИЗМЕНИТСЯ СРАЗУ ===== */}
      <section id="immediate" className="relative py-16 md:py-20 bg-white">
        <SectionMarker n="06" />
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">Что изменится сразу</h2>

          <div className="space-y-4 md:space-y-6 mt-8 md:mt-12">
            {[
              "Перестанешь терять заявки из-за слабых ответов.",
              "Начнёшь закрывать больше записей уже с первого дня.",
              "Повысишь средний чек через правильные предложения.",
              "Станешь увереннее — на всё есть готовый ответ.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 md:gap-4 bg-gray-50 p-4 md:p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-emerald-100 rounded-full mt-1"></span>
                <span className="text-base md:text-lg font-medium text-gray-800">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 07 — ОТЗЫВЫ ===== */}
      <section id="reviews" className="relative py-16 md:py-20 bg-gray-50">
        <SectionMarker n="07" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-12">Отзывы клиентов</h2>

          {/* 4 фото-отзыва */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
            {[1,2,3,4].map((n) => (
              <div key={n} className="group cursor-pointer">
                <img
                  src={`/images/reviews/review${n}.png`}
                  alt={`Отзыв ${n}`}
                  className="w-full h-52 md:h-64 object-cover rounded-2xl border hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                  onClick={() => openLightbox(`/images/reviews/review${n}.png`, n)}
                />
              </div>
            ))}
          </div>

          {/* Reels (не растягиваем, карточки 9:16) */}
          <div className="flex gap-3 justify-center items-start mb-6 md:mb-8 overflow-x-auto pb-2 reels-row">
            {INSTAGRAM_REELS.map((url) => (
              <div key={url} className="reel-card rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                <InstaEmbed url={url} maxWidth={260} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 08 — ОФФЕР ===== */}
      <section id="offer" className="relative py-16 md:py-20 bg-white">
        <SectionMarker n="08" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="js-heading text-3xl lg:text-4xl font-extrabold text-gray-900">Полная система со скидкой 70%</h2>
            <p className="mt-2 text-xs md:text-sm text-gray-500">Спецпредложение на этой неделе • Действует ограниченное время</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl p-7 md:p-8 bg-slate-900 text-white shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-300">
              {/* декаративные шары */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>

              <div className="relative z-10 text-center">
                <div className="text-sm uppercase tracking-wide text-gray-300 mb-3">Полный доступ</div>
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-5 md:mb-6">
                  <span className="text-gray-400 line-through text-xl md:text-2xl">67€</span>
                  <span className="text-4xl md:text-5xl font-extrabold text-white">19€</span>
                </div>

                {/* таймер */}
                <div className="mb-5 md:mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2">
                    {!finished ? (
                      <>
                        <span className="text-white/70 text-sm">До конца:</span>
                        <span className="font-bold tabular-nums text-white">
                          {String(h).padStart(2, "0")}:
                          {String(m).padStart(2, "0")}:
                          {String(s).padStart(2, "0")}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-white">Время истекло</span>
                    )}
                  </div>
                </div>

                <a href={STRIPE_URL} target="_blank" rel="noopener" className="block w-full text-center rounded-xl bg-white text-slate-900 font-bold py-4 px-6 hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg mb-3">
                  Получить со скидкой 70%
                </a>

                <div className="text-[11px] md:text-xs text-gray-300 mb-5">Без скрытых платежей • Пожизненный доступ • Обновления включены</div>

                <div className="text-left mb-4 md:mb-6">
                  <h3 className="text-sm md:text-lg font-bold text-white mb-2 text-center">Что входит:</h3>
                  <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-200">
                    {[
                      "Готовые диалоги для всех ситуаций",
                      "Шаблоны под конкретную услугу",
                      "Бонус: гайд по работе с базой (27€)",
                      "Бонус: 30+ источников клиентов (32€)",
                      "Бонус: продажи на консультации (20€)",
                      "Пожизненный доступ и обновления",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="w-3 h-3 mt-1 rounded-full bg-emerald-400/90"></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs">
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

      {/* ===== 09 — FAQ ===== */}
      <section id="faq" className="relative py-16 md:py-20 bg-white">
        <SectionMarker n="09" />
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="js-heading text-3xl lg:text-4xl font-bold text-center text-gray-900">Частые вопросы</h2>
          <div className="space-y-4 md:space-y-5 mt-8 md:mt-12">
            {[
              { q: "Сработает в моей нише?", a: "Да. База универсальная и блоки под ногти/бровы/ресницы/волосы/косметологию/перманент." },
              { q: "Не будет ли звучать «по-скриптовому»?", a: "Нет. Формулировки живые, адаптируешь под свой тон. Главное — следовать алгоритму." },
              { q: "Зачем это админам?", a: "Единый стандарт повышает конверсию, скорость и управляемость. Новички включаются быстрее." },
              { q: "Когда будут результаты?", a: "Часто в первые 24 часа: готовые фразы экономят время и быстрее ведут к записи." },
            ].map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300">
                <button onClick={() => toggleFaq(i)} className="w-full px-6 md:px-8 py-5 md:py-6 text-left hover:bg-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-lg text-gray-900">{f.q}</span>
                  <span className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>⌄</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 md:px-8 py-5 md:py-6 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 bg-white border-t border-gray-200 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-xl font-bold text-gray-900 mb-4">Beauty Scripts</div>
          <p className="text-gray-500">© {new Date().getFullYear()} Все права защищены</p>
        </div>
      </footer>

      {/* sticky CTA (мобилка) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 lg:hidden">
        <a href={STRIPE_URL} target="_blank" rel="noopener" className="w-full bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold text-center block hover:bg-gray-800 transition-all hover:scale-105">
          Готовые скрипты — 19€ • Купить сейчас
        </a>
      </div>

      {/* CSS: анимации заголовков, reels, компактные карточки */}
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .reels-row { scroll-snap-type: x mandatory; }
        .reels-row > * { scroll-snap-align: center; }
        .reel-card { width: 180px; aspect-ratio: 9 / 16; }
        @media (min-width: 640px){ .reel-card { width: 220px; } }
        @media (min-width: 1024px){ .reel-card { width: 260px; } }

        .js-heading{ opacity: 0; transform: translateY(14px); transition: opacity .7s ease, transform .7s ease; will-change: opacity, transform; }
        .js-heading.head-in{ opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}
