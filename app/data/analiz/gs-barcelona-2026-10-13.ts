import { number, percent } from '../../analiz/_lib/format';
import type { MatchData } from '../../analiz/_lib/replay';
import type { MatchStory } from '../../analiz/_lib/story';
import raw from './gs-barcelona-2026-10-13.json';

const data = raw as MatchData;
const goal = (team: 'home' | 'away', minute: number) => data.shots.find((s) => s.team === team && s.minute === minute && s.outcome === 'goal')!;

export const gsBarcelona: MatchStory = {
  slug: 'galatasaray-barcelona-2026-10-13',
  data,
  competition: 'Şampiyonlar Ligi · Lig aşaması',
  date: '13 Ekim 2026',
  headline: 'Galatasaray 15 dakika favoriydi',
  summary:
    "1–4'lük skorun arkasındaki hikâye: dakika dakika kazanma olasılığı, VAR golü sayılsaydı ne olurdu ve maçın kırılma anlarından 100'er kez yeniden oynanması.",
  deck: [
    'Skor 1–4 ama hikâye o kadar tek taraflı değil. ',
    'Galatasaray 15 dakika boyunca maçın favorisiydi',
    " ve ikinci golü VAR'dan döndü. Maçı kırılma anlarından 100'er kez yeniden oynattık.",
  ],

  numbers: ({ at, per100 }) => {
    const at43 = at(43, 'pace');
    const withVar = per100(at(34.01, 'real', { var: true }));
    const barcaGoals = data.shots.filter((s) => s.team === 'away' && s.outcome === 'goal');
    const allFour = barcaGoals.reduce((p, s) => p * s.xg, 1);
    return [
      {
        value: percent(at43.W),
        text: `43. dakikada Galatasaray'ın kazanma ihtimali. Barcelona'nınki ${percent(at43.L)} idi.`,
        visual: { type: 'bar', outcome: at43 },
      },
      {
        value: String(withVar[0]),
        unit: '/ 100',
        text: "VAR golü sayılsaydı, Galatasaray'ın 100 maçta alacağı galibiyet.",
        visual: { type: 'waffle', counts: withVar },
      },
      {
        value: `${Math.round(1 / allFour / 1000)}.000'de 1`,
        text: "Barcelona'nın gol olan dört şutunun dördünün birden gol olma ihtimali.",
        visual: { type: 'chips', side: 'away', items: barcaGoals.map((s) => percent(s.xg)) },
      },
    ];
  },

  winProbability: {
    title: 'Galatasaray 15 dakika favoriydi',
    lede: 'Her dakikada, o ana kadar olanlara bakarak maçın nasıl biteceğini hesapladık. Üzerine gelince o dakikayı görürsün.',
    text: ({ at }) => {
      const batrakov = goal('home', 28).el;
      const cancelo = goal('away', 43).el;
      return (
        `Batrakov'un golüyle Galatasaray'ın kazanma ihtimali ${percent(at(batrakov, 'pace').W)} seviyesinden ` +
        `${percent(at(batrakov + 0.01, 'pace').W)} seviyesine çıktı, 43. dakikada ${percent(at(cancelo, 'pace').W)} oldu. ` +
        `Cancelo'nun golü bunu tek vuruşta ${percent(at(cancelo + 0.01, 'pace').W)} seviyesine indirdi. ` +
        "Kesik çizgi, 34'teki gol sayılsaydı Galatasaray'ın ihtimalinin nereye çıkacağını gösteriyor."
      );
    },
    annotations: ({ at }) => {
      const batrakov = goal('home', 28).el;
      const cancelo = goal('away', 43).el;
      const fermin = goal('away', 50).el;
      return [
        { x: batrakov - 1.2, y: 0.42, text: "28' Batrakov", anchor: 'end' },
        { x: cancelo + 1.2, y: 0.34, text: "43' Cancelo", anchor: 'start' },
        {
          x: fermin + 1.5,
          y: 0.62,
          text: `50' Fermín: Barcelona ${percent(at(fermin, 'pace').L)} → ${percent(at(fermin + 0.01, 'pace').L)}`,
          anchor: 'start',
        },
      ];
    },
    highlight: { from: goal('home', 28).el, to: goal('away', 43).el, label: 'Galatasaray favori' },
    // Drawn until Cancelo's goal; after it the what-if line runs on top of Barcelona's and only adds clutter
    counterfactual: { id: 'var', legend: 'VAR golü sayılsaydı', tooltip: 'VAR golü sayılsaydı GS', until: goal('away', 43).el },
  },

  replay: {
    title: 'O andan 100 kez yeniden oynasaydık',
    lede: 'Maçın geri kalanındaki gerçek pozisyonlar aynı kalıyor; sadece hangisinin gole döneceği yeniden belirleniyor. Her kare bir maç.',
    cards: [
      {
        m: 28.01,
        chip: "28'",
        title: 'Batrakov golü',
        text: ({ pace }) =>
          `Galatasaray 1–0 öne geçti ve kazanma ihtimali ${percent(pace.W)} oldu. Ama Barcelona'nın sonradan yaratacağı pozisyonlar bu tabloyu tersine çeviriyor.`,
      },
      {
        m: 34.01,
        on: { var: true },
        chip: "34'",
        title: 'VAR golü sayılsaydı',
        whatif: true,
        text: ({ n }) =>
          `Barış Alper'in golü ofsayttan iptal edildi. Sayılsaydı skor 2–0 olurdu ve Galatasaray ${n[1]} maçta da berabere kalırdı.`,
      },
      {
        m: 43,
        chip: "43'",
        title: "Cancelo'dan hemen önce",
        text: ({ pace, api }) =>
          `Skor 1–0 ve Galatasaray ${percent(pace.W)} ile favori. Ama Barcelona'nın bundan sonraki şutları toplam ${number(api.xgFrom('away', 43), 1)} gol değerinde.`,
      },
      {
        m: 0,
        on: { var: true, akgun: true, cancelo: true },
        chip: 'Ya?',
        title: 'Üç an değişseydi',
        whatif: true,
        hideScore: true,
        text: ({ n }) =>
          `VAR golü sayılsa, Yunus Akgün 37'de atsa, Cancelo 43'te kaçırsa. Diğer her şut aynı kalınca Barcelona'nın galibiyeti ${n[2]} maça düşüyor.`,
      },
    ],
  },

  simulator: {
    title: 'İstediğin dakikadan, istediğin "ya olsaydı" ile oynat',
    presets: [
      { m: 0, label: 'Başlama' },
      { m: 28.01, label: "28' 1–0" },
      { m: 43, label: "43'" },
      { m: 49, label: 'Devre' },
    ],
  },

  whatifs: [
    { id: 'var', label: "34' Barış Alper'in golü sayılsın", kind: 'add', team: 'home', minute: 34 },
    { id: 'akgun', label: "37' Yunus Akgün'ün şutu gol olsun", kind: 'goal', team: 'home', minute: 37 },
    { id: 'cancelo', label: "43' Cancelo'nun şutu dışarı gitsin", kind: 'miss', team: 'away', minute: 43 },
    { id: 'gordon', label: "47' Gordon altıpastan atsın", kind: 'goal', team: 'away', minute: 47 },
  ],

  sourceUrl: 'https://www.espn.com/soccer/match/_/gameId/401915435',
};
