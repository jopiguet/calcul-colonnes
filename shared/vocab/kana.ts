/**
 * Kana to Hepburn rōmaji, for grading: an answer typed in kana (ねこ) is
 * compared with the entry's reading (neko), so a kanji word (猫) can be
 * answered without knowing its kanji. Long vowels come out doubled (ー and
 * おう both repeat the vowel); `romajiKey` folds them anyway.
 */
const BASE: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o", ゃ: "ya", ゅ: "yu", ょ: "yo", ゎ: "wa",
};

/** Katakana → hiragana: same sounds, 0x60 apart. */
function hiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export const hasKana = (text: string): boolean => /[ぁ-ゖァ-ヺ]/.test(text);

export function kanaToRomaji(input: string): string {
  const text = hiragana(input.normalize("NFKC"));
  let out = "";
  let double = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    const next = text[i + 1] ?? "";
    if (c === "っ") {
      double = true;
      continue;
    }
    if (c === "ー") {
      out += /[aeiou]$/.exec(out)?.[0] ?? "";
      continue;
    }
    let sound = BASE[c];
    if (sound === undefined) {
      out += c;
      double = false;
      continue;
    }
    // Contracted sounds: き + ゃ → kya, し + ゃ → sha, ち + ゃ → cha, ふ + ぁ → fa.
    if (next && "ゃゅょ".includes(next) && sound.endsWith("i") && sound.length > 1) {
      const y = BASE[next]!;
      sound = /^(sh|ch|j)i$/.test(sound) ? sound.slice(0, -1) + y.slice(1) : sound.slice(0, -1) + y;
      i++;
    } else if (next && "ぁぃぅぇぉ".includes(next) && sound.length > 1) {
      sound = sound.slice(0, -1) + BASE[next]!;
      i++;
    }
    if (double) {
      out += sound.startsWith("ch") ? "t" : sound[0];
      double = false;
    }
    out += sound;
  }
  return out;
}
