import React from 'react';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';  // 需要安装 katex
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/default.css';
import './MarkdownWithLatex.css';

// 正确配置 texmath 使用 KaTeX
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
}).use(texmath, {
  engine: katex,  // 指定使用 KaTeX
  delimiters: 'dollars',  // 使用 $...$ 和 $$...$$
  katexOptions: {
    macros: {
      "\\RR": "\\mathbb{R}"
    }
  }
});

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
