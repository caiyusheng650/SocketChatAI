import React from 'react';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/default.css';
import './MarkdownWithLatex.css';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  },
}).use(texmath);

const MarkdownWithLatex = ({ markdownContent }) => {
  const html = md.render(markdownContent);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ 
        textAlign: 'left',
        lineHeight: '1.6',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%'
      }}
      className="markdown-latex-container"
    />
  );
};

export default MarkdownWithLatex;