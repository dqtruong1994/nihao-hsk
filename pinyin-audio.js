(() => {
  'use strict';

  // Chinese example syllables for Mandarin speech synthesis, not isolated sounds.
  // Spelling reference: Ministry of Education, Hanyu Pinyin Scheme:
  // https://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html
  // Readable transcription: https://yywz.ecnu.edu.cn/1f/56/c30556a335702/page.htm
  // The key names the learning unit; pinyin and label name the WHOLE spoken syllable.
  const initials = {
    b: ['波', 'bō'],
    p: ['坡', 'pō'],
    m: ['妈', 'mā'],
    f: ['飞', 'fēi'],
    d: ['低', 'dī'],
    t: ['梯', 'tī'],
    n: ['拿', 'ná'],
    l: ['拉', 'lā'],
    g: ['哥', 'gē'],
    k: ['科', 'kē'],
    h: ['黑', 'hēi'],
    j: ['鸡', 'jī'],
    q: ['七', 'qī'],
    x: ['西', 'xī'],
    zh: ['知', 'zhī'],
    ch: ['吃', 'chī'],
    sh: ['诗', 'shī'],
    r: ['日', 'rì'],
    z: ['资', 'zī'],
    c: ['擦', 'cā'],
    s: ['丝', 'sī'],
  };

  // Some finals need an initial in their natural example syllable (e.g. ei/eng/ong).
  // un is the shortened spelling of uen; it is not ün. ong, ueng, and iong differ.
  const finals = {
    a: ['八', 'bā'],
    o: ['波', 'bō'],
    e: ['鹅', 'é'],
    i: ['衣', 'yī'],
    u: ['屋', 'wū'],
    'ü': ['鱼', 'yú'],
    ai: ['哀', 'āi'],
    ei: ['飞', 'fēi'],
    ao: ['奥', 'ào'],
    ou: ['欧', 'ōu'],
    ia: ['鸭', 'yā'],
    ie: ['爷', 'yé'],
    ua: ['蛙', 'wā'],
    uo: ['窝', 'wō'],
    'üe': ['月', 'yuè'],
    iao: ['腰', 'yāo'],
    'iou (iu)': ['忧', 'yōu'],
    uai: ['歪', 'wāi'],
    'uei (ui)': ['威', 'wēi'],
    an: ['安', 'ān'],
    en: ['恩', 'ēn'],
    in: ['因', 'yīn'],
    un: ['温', 'wēn'],
    'ün': ['云', 'yún'],
    ian: ['烟', 'yān'],
    uan: ['弯', 'wān'],
    'üan': ['冤', 'yuān'],
    ang: ['昂', 'áng'],
    eng: ['灯', 'dēng'],
    ing: ['英', 'yīng'],
    ong: ['冬', 'dōng'],
    iang: ['央', 'yāng'],
    uang: ['汪', 'wāng'],
    ueng: ['翁', 'wēng'],
    iong: ['拥', 'yōng'],
    er: ['儿', 'ér'],
  };

  // a/o/e tone examples use complete syllables with clear Chinese spellings.
  // Their labels show the added initial explicitly instead of promising a bare vowel.
  const tones = {
    'mā': ['妈', 'mā', 1],
    'má': ['麻', 'má', 2],
    'mǎ': ['马', 'mǎ', 3],
    'mà': ['骂', 'mà', 4],
    'ā': ['八', 'bā', 1],
    'á': ['拔', 'bá', 2],
    'ǎ': ['把', 'bǎ', 3],
    'à': ['爸', 'bà', 4],
    'ō': ['波', 'bō', 1],
    'ó': ['婆', 'pó', 2],
    'ǒ': ['跛', 'bǒ', 3],
    'ò': ['破', 'pò', 4],
    'ē': ['哥', 'gē', 1],
    'é': ['鹅', 'é', 2],
    'ě': ['可', 'kě', 3],
    'è': ['课', 'kè', 4],
    'ī': ['衣', 'yī', 1],
    'í': ['姨', 'yí', 2],
    'ǐ': ['以', 'yǐ', 3],
    'ì': ['意', 'yì', 4],
    'ū': ['屋', 'wū', 1],
    'ú': ['无', 'wú', 2],
    'ǔ': ['五', 'wǔ', 3],
    'ù': ['物', 'wù', 4],
    'ǖ': ['迂', 'yū', 1],
    'ǘ': ['鱼', 'yú', 2],
    'ǚ': ['雨', 'yǔ', 3],
    'ǜ': ['玉', 'yù', 4],
  };

  const pronunciation = {};
  for (const [category, examples] of Object.entries({ initial: initials, final: finals, tone: tones })) {
    for (const [unit, [text, pinyin, tone]] of Object.entries(examples)) {
      pronunciation[`${category}:${unit}`] = Object.freeze({
        text,
        pinyin,
        label: `Âm tiết ví dụ: ${pinyin} (${text})${tone ? ` · thanh ${tone}` : ''}`,
      });
    }
  }

  window.HSKPronunciation = Object.freeze(pronunciation);
})();
