'use client';

import { useState } from 'react';
import { Flame, Lock, Star } from 'lucide-react';
import { units, type Unit } from './course';
import { itemText } from './exercises';
import styles from './ingilizce.module.css';
import { Mascot } from './Mascot';
import { AVATARS, resetProgress, setMuted, setProfile, setSpeaking, TOP_BOX, type ProgressView } from './progress';
import { STICKERS } from './stickers';
import { BLUE, GREEN, Modal, MUTED, PressButton, RED, SpeakButton, WeekRow } from './ui';

const inputClass =
  'h-13 w-full rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 text-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none';

function AvatarPicker({ value, onChange }: { value: string; onChange: (avatar: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-4 gap-2">
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          role="radio"
          aria-checked={avatar === value}
          aria-label={avatar}
          onClick={() => onChange(avatar)}
          className={`grid aspect-square place-items-center rounded-2xl border-2 border-b-4 text-4xl transition-colors ${
            avatar === value ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}

/** First visit: Fındık asks for a name and an animal; both can be skipped */
export function WelcomeModal({ progress }: { progress: ProgressView }) {
  const [name, setName] = useState(progress.name);
  const [avatar, setAvatar] = useState(progress.avatar);
  return (
    <Modal title="Merhaba! Ben Fındık">
      <div className="mt-2 flex items-center gap-3">
        <Mascot mood="happy" className="h-28 w-24 shrink-0" />
        <p className="text-lg leading-snug text-slate-600">
          Seninle birlikte İngilizce öğreneceğiz. Önce tanışalım: adın ne?
        </p>
      </div>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setProfile(name, avatar);
        }}
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={20}
          autoComplete="off"
          aria-label="Adın"
          placeholder="Adın"
          className={inputClass}
        />
        <p className="font-bold text-slate-600">Bir hayvan seç:</p>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <PressButton type="submit" face={GREEN} className="mt-2">
          Hadi başlayalım!
        </PressButton>
        <button
          type="button"
          onClick={() => setProfile('', avatar)}
          className="text-sm font-bold text-slate-400 hover:text-slate-600"
        >
          Sonra
        </button>
      </form>
    </Modal>
  );
}

export function AlbumModal({ owned, onClose }: { owned: string[]; onClose: () => void }) {
  return (
    <Modal title="Çıkartma albümüm" onClose={onClose} className="max-w-lg">
      <p className="mt-1 font-bold text-slate-500">
        {owned.length} / {STICKERS.length} çıkartma
      </p>
      <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {STICKERS.map((sticker) => {
          const earned = owned.includes(sticker.id);
          return (
            <li
              key={sticker.id}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center ${
                earned ? 'border-b-4 border-amber-300 bg-amber-50' : 'border-dashed border-slate-300 bg-slate-50'
              }`}
            >
              <span aria-hidden="true" className={`text-4xl leading-none ${earned ? '' : 'opacity-25 grayscale'}`}>
                {sticker.emoji}
              </span>
              <span className={`text-sm font-extrabold leading-tight ${earned ? 'text-slate-800' : 'text-slate-400'}`}>
                {earned ? sticker.name : '???'}
              </span>
              {!earned && <span className="text-xs leading-tight text-slate-500">{sticker.hint}</span>}
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

// How well a word is remembered, from its spaced repetition box
function strength(box: number) {
  if (box >= TOP_BOX - 1) return { label: 'Ezberledin', tone: 'bg-green-100 text-green-800' };
  if (box >= 2) return { label: 'İyi gidiyor', tone: 'bg-sky-100 text-sky-800' };
  return { label: 'Yeni', tone: 'bg-amber-100 text-amber-800' };
}

/** Every word from the finished lessons, by unit, with its sound and how well it is remembered */
export function WordBookModal({ progress, onClose }: { progress: ProgressView; onClose: () => void }) {
  const groups = units
    .map((unit) => ({ unit, words: unit.lessons.filter((lesson) => progress.completed[lesson.id]).flatMap((l) => l.words) }))
    .filter((group) => group.words.length > 0);
  const count = groups.reduce((sum, group) => sum + group.words.length, 0);
  return (
    <Modal title="Kelime defterim" onClose={onClose} className="max-w-lg">
      <p className="mt-1 font-bold text-slate-500">{count} kelime öğrendin</p>
      <div className="mt-4 flex flex-col gap-5">
        {groups.map(({ unit, words }) => (
          <section key={unit.id}>
            <h3 className={`${styles.display} text-lg font-bold text-slate-600`}>
              {unit.emoji} {unit.title}
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {words.map((word) => {
                const level = strength(progress.memory[`w:${word.en}`]?.[0] ?? 0);
                return (
                  <li key={word.en} className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 py-1.5 pl-2 pr-3">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center text-2xl">
                      {word.emoji ?? '💬'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span lang="en" className="block font-extrabold leading-tight">
                        {word.en}
                      </span>
                      <span className="block text-sm text-slate-500">{word.tr}</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${level.tone}`}>{level.label}</span>
                    <SpeakButton text={word.en} className="size-9" />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}

export function GuideModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <Modal title={`${unit.emoji} ${unit.title}: ipuçları`} onClose={onClose} className="max-w-lg">
      <div className="mt-4 flex flex-col gap-3">
        {unit.tips.map((tip) => (
          <article
            key={tip.title}
            className="rounded-2xl border-2 border-l-8 border-slate-200 bg-white p-4"
            style={{ borderLeftColor: unit.color }}
          >
            <h3 className={`${styles.display} text-xl font-bold`}>{tip.title}</h3>
            <p className="mt-1 leading-relaxed text-slate-600">{tip.body}</p>
            <ul className="mt-3 flex flex-col gap-1">
              {tip.examples.map((example) => (
                <li key={example.en} className="flex flex-wrap items-center gap-x-2">
                  <SpeakButton text={example.en} className="size-9" />
                  <span lang="en" className="font-extrabold text-slate-800">
                    {example.en}
                  </span>
                  <span className="text-slate-500">{example.tr}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Modal>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 px-4 py-3">
      <span className="font-bold">{label}</span>
      <input type="checkbox" checked={on} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-green-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky-500 after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}

/** Settings and a summary for grown-ups, behind a small sum children are unlikely to solve */
export function ParentModal({
  progress,
  recognizes,
  homeUnit,
  gate,
  onClose,
}: {
  progress: ProgressView;
  recognizes: boolean;
  /** The unit the child is on, whose at-home game is suggested */
  homeUnit: Unit;
  gate: [number, number];
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [name, setName] = useState(progress.name);
  const [avatar, setAvatar] = useState(progress.avatar);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!unlocked) {
    return (
      <Modal title="Ebeveyn köşesi" onClose={onClose}>
        <form
          className="mt-3 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (Number(answer) === gate[0] * gate[1]) setUnlocked(true);
            else setWrongAnswer(true);
          }}
        >
          <p className="flex items-center gap-2 text-slate-600">
            <Lock aria-hidden="true" className="size-5 shrink-0" />
            Bu bölüm büyükler için. Devam etmek için soruyu cevapla.
          </p>
          <label className={`${styles.display} text-3xl font-bold`}>
            {gate[0]} × {gate[1]} = ?
            <input
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setWrongAnswer(false);
              }}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              className={`${inputClass} mt-3 block`}
            />
          </label>
          {wrongAnswer && <p className="font-bold text-rose-600">Olmadı, bir daha dene.</p>}
          <PressButton type="submit" face={answer === '' ? MUTED : BLUE} disabled={answer === ''}>
            Aç
          </PressButton>
        </form>
      </Modal>
    );
  }

  const finishedStops = Object.keys(progress.completed).length;
  const profileChanged = name.trim() !== progress.name || avatar !== progress.avatar;
  const recentMistakes = [...progress.mistakes]
    .reverse()
    .map((key) => itemText(key))
    .filter((text) => text !== null)
    .slice(0, 8);
  const newWords = progress.newThisWeek
    .filter((key) => key.startsWith('w:'))
    .map((key) => itemText(key))
    .filter((text) => text !== null);

  return (
    <Modal title="Ebeveyn köşesi" onClose={onClose} className="max-w-lg">
      <section className="mt-5">
        <h3 className={`${styles.display} text-lg font-bold text-slate-500`}>Bu hafta</h3>
        <WeekRow week={progress.week} className="mt-2" />
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border-2 border-slate-200 p-3">
            <dt className="text-xs font-bold text-slate-500">Seri</dt>
            <dd className="mt-1 flex items-center justify-center gap-1 text-2xl font-extrabold">
              <Flame aria-hidden="true" className="size-5 fill-orange-400 text-orange-500" />
              {progress.streak}
            </dd>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 p-3">
            <dt className="text-xs font-bold text-slate-500">Biten durak</dt>
            <dd className="mt-1 text-2xl font-extrabold">{finishedStops}</dd>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 p-3">
            <dt className="text-xs font-bold text-slate-500">Yıldız</dt>
            <dd className="mt-1 flex items-center justify-center gap-1 text-2xl font-extrabold">
              <Star aria-hidden="true" className="size-5 fill-amber-400 text-amber-500" />
              {progress.totalStars}
            </dd>
          </div>
        </dl>
      </section>

      {newWords.length > 0 && (
        <section className="mt-6">
          <h3 className={`${styles.display} text-lg font-bold text-slate-500`}>Bu hafta öğrendiği kelimeler</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {newWords.map((word) => (
              <li key={word.en} className="rounded-full bg-sky-50 px-3 py-1 text-sm">
                <span lang="en" className="font-bold">
                  {word.en}
                </span>
                <span className="text-slate-500"> · {word.tr}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
        <h3 className={`${styles.display} text-lg font-bold text-amber-800`}>
          Evde birlikte: {homeUnit.emoji} {homeUnit.title}
        </h3>
        <p className="mt-1 leading-relaxed text-amber-900">{homeUnit.homeIdea}</p>
      </section>

      <section className="mt-6">
        <h3 className={`${styles.display} text-lg font-bold text-slate-500`}>Son hatalar</h3>
        {recentMistakes.length === 0 ? (
          <p className="mt-2 text-slate-500">Şu an bekleyen hata yok.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {recentMistakes.map((text) => (
              <li key={text.en} className="rounded-xl bg-slate-50 px-3 py-2">
                <span lang="en" className="font-bold">
                  {text.en}
                </span>
                <span className="text-slate-500"> · {text.tr}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <h3 className={`${styles.display} text-lg font-bold text-slate-500`}>Profil</h3>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={20}
          autoComplete="off"
          aria-label="Çocuğun adı"
          placeholder="Çocuğun adı"
          className={inputClass}
        />
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <PressButton face={profileChanged ? GREEN : MUTED} disabled={!profileChanged} onClick={() => setProfile(name, avatar)}>
          Kaydet
        </PressButton>
      </section>

      <section className="mt-6 flex flex-col gap-2">
        <h3 className={`${styles.display} text-lg font-bold text-slate-500`}>Ayarlar</h3>
        <Toggle label="Sesler ve otomatik okuma" on={!progress.muted} onChange={(on) => setMuted(!on)} />
        {recognizes && (
          <Toggle label="Konuşma alıştırmaları" on={progress.speaking} onChange={(on) => setSpeaking(on)} />
        )}
      </section>

      <p className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">
        Tüm ilerleme yalnızca bu tarayıcıda saklanır; hiçbir yere gönderilmez. Tarayıcı verileri silinirse ilerleme de
        silinir. Konuşma alıştırmalarında ses, tarayıcının konuşma tanıma hizmetiyle yazıya çevrilir.
      </p>

      <div className="mt-6 border-t-2 border-slate-100 pt-4">
        {confirmingReset ? (
          <div className="flex flex-col gap-2">
            <p className="font-bold text-rose-700">Bütün yıldızlar, dersler ve çıkartmalar silinecek. Emin misin?</p>
            <div className="flex gap-2">
              <PressButton
                face={RED}
                className="flex-1"
                onClick={() => {
                  resetProgress();
                  setConfirmingReset(false);
                }}
              >
                Sil
              </PressButton>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="flex-1 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="text-sm font-bold text-rose-600 hover:underline"
          >
            İlerlemeyi sıfırla
          </button>
        )}
      </div>
    </Modal>
  );
}
