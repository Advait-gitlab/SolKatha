// src/services/gita.js
// Unified utilities to load Bhagavad Gita data from /data folder

import verses from '../data/verse.json';
import chapters from '../data/chapters.json';
import translations from '../data/translation.json';
import commentary from '../data/commentary.json';
import authors from '../data/authors.json';
import languages from '../data/languages.json';

/**
 * Returns a random verse with its translation and commentary
 */
export function getRandomVerse() {
  if (!Array.isArray(verses) || verses.length === 0) {
    return {
      chapter: 0,
      verse: 0,
      text: "No verses found.",
      translation: "Please check verse.json",
      commentary: "",
      author: "",
      language: ""
    };
  }

  const randomIndex = Math.floor(Math.random() * verses.length);
  const verse = verses[randomIndex];
  const translation = translations.find(
    t => t.chapter === verse.chapter && t.verse === verse.verse
  );
  const comment = commentary.find(
    c => c.chapter === verse.chapter && c.verse === verse.verse
  );

  return {
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    translation: translation ? translation.text : "",
    commentary: comment ? comment.text : "",
    author: comment ? authors.find(a => a.id === comment.authorId)?.name : "",
    language: languages[0]?.name || "Sanskrit"
  };
}

/**
 * Returns a specific verse by chapter and verse number
 */
export function getVerse(chapter, verseNum) {
  const verse = verses.find(v => v.chapter === chapter && v.verse === verseNum);
  if (!verse) return null;

  const translation = translations.find(
    t => t.chapter === chapter && t.verse === verseNum
  );
  const comment = commentary.find(
    c => c.chapter === chapter && c.verse === verseNum
  );

  return {
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    translation: translation ? translation.text : "",
    commentary: comment ? comment.text : "",
    author: comment ? authors.find(a => a.id === comment.authorId)?.name : "",
    language: languages[0]?.name || "Sanskrit"
  };
}
