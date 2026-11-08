# Sounds of the courses

Four courses can be listened to: 🌴 Malayalam, 𓋹 Hieroglyphic Egyptian, Sumerian and Akkadian. A ▶ stands after a word of the lesson text, in a table of signs or letters, after a proverb, and on the Malayalam letter cards once a card is answered. The voice is synthetic: clear enough to hear how a word goes, robotic, and for the three ancient languages a convention, not a recording of the language.

## What is said

| Course | Spoken from | Voice | What you hear |
|---|---|---|---|
| Malayalam | the script itself | eSpeak NG's Malayalam voice | today's pronunciation, as the synthesiser knows it; ഴ comes out close to an r |
| Egyptian | the transliteration | phonemes, Italian voice | the Egyptological school reading: an *e* between two consonants, ꜣ and ꜥ as *a*, j as *i*, w as *u* between consonants, ḫ ẖ as *kh*, š as *sh*, ṯ as *tj*, ḏ as *dj*: *nfr* "nefer", *sḏm.f* "sedjemef"; a few words as usage has them (*ꜥnḫ* "ankh", *ptḥ* "ptah") |
| Akkadian | the transliteration | phonemes, Italian voice | the usual reconstruction: š *sh*, ḫ *kh*, ʾ a glottal stop, the emphatics as their plain consonant, long vowels long, the stress on the last long or closed syllable before the final one (a contracted final vowel takes it); a hyphenated spelling sign by sign (*ša-ar-ru-um*) |
| Sumerian | the transliteration | phonemes, Italian voice | the conventional values: ĝ *ng*, ḫ *kh*, š *sh*, the sign numbers dropped (*e₂-gal* "egal") |

Nobody knows how Egyptian, Akkadian or Sumerian sounded, word by word; the readings are the ones teachers use aloud. A ▶'s tooltip gives the reading when it differs from the transliteration (*Écouter « nefer »*).

## Which words

The same function, `soundTargets` in `src/sound-targets.ts`, picks the words in the browser and at build time:

- an italic (`*nfr*`), the way the courses write transliterations;
- a table cell holding only text (the letter column of the table of signs);
- a run of Malayalam script.

For the ancient languages a word must be written the same way in the French, Spanish and English versions of the lesson, so an italic of one language (emphasis) is never spoken, and it must use only the letters of its transliteration (`server/pronounce.ts`). Words in the exercises have no ▶: it would give the answer away. The course vocabulary lists and cards have none either; the letter cards have one, after the answer.

## Making the sounds

```sh
npm run sounds:build                 # every course with sounds
npm run sounds:build -- egyptian     # one course
npm run check:sounds                 # fails when a sound is missing or sounds.json is out of date
```

`server/sounds-build.ts` renders each lesson as the browser does (under jsdom), collects the words, turns each into eSpeak input (`server/pronounce.ts`), synthesises it with [eSpeak NG](https://github.com/espeak-ng/espeak-ng) compiled to WebAssembly (the `espeak-ng` dev dependency) at speed 135, and encodes it with ffmpeg as a mono 32 kbit/s MP3, the silence cut. A file is named after what it says (`sha1(voice, speed, input)`, 12 characters), so a word met in several lessons has one file and a build makes only what changed; files no longer listed are removed.

Output, per course: `content/courses/<id>/sounds/<hash>.mp3` and `content/courses/<id>/sounds.json`:

```json
{ "engine": "eSpeak NG", "items": { "nfr": { "file": "53dab7ba638f.mp3", "reading": "nefer" } } }
```

Run the build after changing a lesson of these four courses, a letter card or `server/pronounce.ts`. It needs ffmpeg on the machine; the app itself needs neither ffmpeg nor eSpeak.

## Licences

eSpeak NG is GPL-3.0. It is a build tool here: it is not bundled, not served and not in the release archive (it lives in `node_modules`). The sounds are its output, made from the courses' own words.

## Serving

- `GET /api/courses/:id/sounds` — the course's `items` (`{}` for a course without sounds), cached an hour.
- `GET /api/courses/:id/sounds/:file` — one MP3 (`audio/mpeg`), cached for good: its name changes when its sound does. Only names of the form `<12 hex>.mp3` are served.

Both need a session, like the rest of the courses. A lesson's view says whether its course has sounds (`course.sounds`), and the browser asks for the list once per course (`src/sound.ts`). One sound plays at a time.
