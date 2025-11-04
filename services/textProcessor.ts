import type { DocumentAnalysis } from '../types';

const getStopWords = () => {
  // Un elenco combinato di stopword inglesi e italiane
  return new Set([
    // Italiano
    'a', 'ad', 'adesso', 'ai', 'al', 'alla', 'allo', 'allora', 'altre', 'altri', 'altro',
    'anche', 'ancora', 'avere', 'aveva', 'avevano', 'c', 'che', 'chi', 'ci', 'coi', 'come',
    'con', 'contro', 'cui', 'da', 'dai', 'dal', 'dalla', 'dallo', 'de', 'degli', 'dei',
    'del', 'della', 'dello', 'dentro', 'di', 'dopo', 'dove', 'e', 'ed', 'era', 'erano',
    'essere', 'fino', 'fra', 'fu', 'furono', 'gli', 'ha', 'hanno', 'i', 'il', 'in', 'io',
    'l', 'la', 'le', 'lei', 'li', 'lo', 'loro', 'lui', 'ma', 'me', 'mi', 'mia', 'mie',
    'miei', 'mio', 'molto', 'ne', 'negli', 'nei', 'nel', 'nella', 'nello', 'noi', 'non',
    'nostra', 'nostre', 'nostri', 'nostro', 'o', 'ogni', 'per', 'perché', 'più', 'posso',
    'quale', 'quando', 'quante', 'quanti', 'quanto', 'quella', 'quelle', 'quelli', 'quello',
    'questa', 'queste', 'questi', 'questo', 're', 'se', 'sei', 'senza', 'si', 'sia', 'siamo',
    'siete', 'sono', 'sopra', 'sotto', 'sta', 'stai', 'stando', 'stanno', 'stare', 'stava',
    'stavano', 'ste', 'sti', 'sto', 'su', 'sua', 'sue', 'sui', 'suo', 'sul', 'sulla', 'sullo',
    't', 'te', 'ti', 'tra', 'tu', 'tua', 'tue', 'tuo', 'tutti', 'tutto', 'un', 'una', 'uno',
    'vi', 'voi', 'vostra', 'vostre', 'vostri', 'vostro',

    // Inglese
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on',
    'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    's', 't', 'can', 'will', 'just', 'don', 'should', 'now', ''
  ]);
};

export const analyzeText = (text: string): DocumentAnalysis => {
  const stopWords = getStopWords();
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/);

  const filteredWords = words.filter(word => !stopWords.has(word) && word.length > 2);

  const wordCount = filteredWords.length;
  const uniqueWords = new Set(filteredWords).size;

  const wordFreqCounter: Record<string, number> = {};
  for (const word of filteredWords) {
    wordFreqCounter[word] = (wordFreqCounter[word] || 0) + 1;
  }

  const wordFreq = Object.entries(wordFreqCounter)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    wordCount,
    uniqueWords,
    wordFreq,
  };
};