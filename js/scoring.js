/* Automated scoring support.
   Heuristic analysis: fully local, free, runs on every writing/speaking response.
   This is NOT equivalent to real CELPIP rater judgment: it cannot assess whether
   your ideas make sense or your argument is coherent. It's an objective proxy for
   the Vocabulary/Readability/structure dimensions, nothing more.
   v2 note: the optional AI grading (which sent your text to a cloud service with an API key kept in
   the browser) was removed on 2026-10-22, so nothing in this file uses the network. */

// ---------- Heuristic text analysis ----------
// LEARNING NOTE (for beginners): this file judges written or spoken answers.
// analyzeText is simple arithmetic on the text: vocabulary variety, readability,
// sentence structure and linking words, each scored 0-100 and blended into one number.
// It cannot understand meaning, so it is a rough guide only.
//
// A Set holds each word once and answers "is this word in here?" quickly.
const COMMON_WORDS = new Set(("the of and a to in is you that it he was for on are as with his they i at be this have "
  + "from or one had by word but not what all were we when your can said there use an each which she do how their if "
  + "will up other about out many then them these so some her would make like him into time has look two more write go "
  + "see number no way could people my than first water been call who oil its now find long down day did get come made "
  + "may part over new sound take only little work know place year live me back give most very after thing our just name "
  + "good sentence man think say great where help through much before line right too mean old any same tell boy follow "
  + "came want show also around form three small set put end does another well large must big even such because turn "
  + "here why ask went men read need land different home us move try kind hand picture again change off play spell air "
  + "away animal house point page letter mother answer found study still learn should america world dear hi hello thanks "
  + "thank sincerely regards best email manager team please could would should").split(/\s+/));

const TRANSITION_WORDS = ["however", "therefore", "furthermore", "moreover", "in addition", "for example", "for instance",
  "first", "second", "third", "finally", "in conclusion", "on the other hand", "as a result", "in fact", "meanwhile",
  "consequently", "in contrast", "similarly", "although", "because", "since", "while", "in summary", "overall",
  "additionally", "besides", "specifically", "in particular", "to illustrate", "as well as", "not only", "in my opinion"];

const FILLER_WORDS = ["um", "uh", "umm", "uhh", "like", "you know", "sort of", "kind of", "basically", "actually", "i mean", "so yeah"];

// Splits text after . ! or ? (a regular expression, i.e. a text-matching pattern).
function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]).map(s => s.trim()).filter(Boolean);
}
function splitWords(text) {
  return (text.toLowerCase().match(/[a-z']+/g) || []);
}
// A rough guess at syllables: count runs of vowels after trimming common silent endings.
// Good enough for a readability estimate, not exact.
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
// The Flesch formula: shorter sentences and shorter words give a higher (easier) score.
function fleschReadingEase(text) {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (!sentences.length || !words.length) return null;
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);
  return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
}

// Composite 0-100 heuristic score + subscores, for writing OR a speaking transcript.
// Returns an object with the sub-scores. Some ideas used below:
// type-token ratio = unique words divided by total words (higher means more varied vocabulary);
// standard deviation = how much sentence lengths differ (variety reads as better style).
function analyzeText(text, opts = {}) {
  const words = splitWords(text);
  const sentences = splitSentences(text);
  const wordCount = words.length;

  if (wordCount < 8) {
    return { wordCount, insufficientData: true, compositePct: 0, clb: 1, subscores: {} };
  }

  // Vocabulary: type-token ratio (normalized), average word length, rare-word ratio
  const unique = new Set(words);
  const ttr = unique.size / wordCount; // naturally decays with length
  const normalizedTtr = Math.min(1, ttr * Math.sqrt(wordCount / 10)); // length-corrected proxy
  const avgWordLen = words.reduce((a, w) => a + w.length, 0) / wordCount;
  const rareRatio = words.filter(w => w.length >= 6 && !COMMON_WORDS.has(w)).length / wordCount;
  const vocabScore = Math.min(100, Math.round(
    (Math.min(1, normalizedTtr / 0.55)) * 40 +
    (Math.min(1, avgWordLen / 5.2)) * 30 +
    (Math.min(1, rareRatio / 0.28)) * 30
  ));

  // Readability: sweet spot around Flesch 40-65 (competent adult writing), penalize extremes
  const flesch = fleschReadingEase(text);
  let readabilityScore = 60;
  if (flesch !== null) {
    const dist = Math.abs(flesch - 52);
    readabilityScore = Math.max(0, Math.round(100 - dist * 1.4));
  }

  // Structure/mechanics: sentence length variety, run-on penalty, capitalization/punctuation
  const sentLens = sentences.map(s => splitWords(s).length).filter(n => n > 0);
  const avgSentLen = sentLens.reduce((a, n) => a + n, 0) / (sentLens.length || 1);
  const variance = sentLens.reduce((a, n) => a + Math.pow(n - avgSentLen, 2), 0) / (sentLens.length || 1);
  const stdDev = Math.sqrt(variance);
  const varietyScore = Math.min(100, Math.round((Math.min(1, stdDev / 6)) * 100));
  const longSentences = sentLens.filter(n => n > 35).length;
  const mechanicsIssues = sentences.filter(s => {
    const t = s.trim();
    return t && (!/^[A-Z"']/.test(t) || !/[.!?]$/.test(t));
  }).length;
  const structureScore = Math.max(0, Math.round(varietyScore - longSentences * 15 - mechanicsIssues * 3));

  // Coherence proxy: transition/linking word density
  const lower = text.toLowerCase();
  const transitionCount = TRANSITION_WORDS.reduce((a, tw) => a + (lower.split(tw).length - 1), 0);
  const transitionDensity = transitionCount / Math.max(1, sentences.length);
  const coherenceScore = Math.min(100, Math.round(transitionDensity * 140 + 25));

  const composite = Math.round(
    vocabScore * 0.3 + readabilityScore * 0.25 + structureScore * 0.25 + coherenceScore * 0.2
  );

  const result = {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(avgSentLen * 10) / 10,
    fleschReadingEase: flesch === null ? null : Math.round(flesch),
    subscores: { vocabulary: vocabScore, readability: readabilityScore, structure: structureScore, coherence: coherenceScore },
    compositePct: Math.max(0, Math.min(100, composite)),
  };
  result.clb = clbFromPercent(result.compositePct);

  if (opts.durationSec) {
    result.wpm = Math.round(wordCount / (opts.durationSec / 60));
    const lowerT = " " + lower + " ";
    result.fillerCount = FILLER_WORDS.reduce((a, f) => a + (lowerT.split(" " + f + " ").length - 1), 0);
  }
  return result;
}
