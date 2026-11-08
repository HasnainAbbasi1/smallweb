
import sanitizeHtml from 'sanitize-html';

export function sanitizeWebsiteHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'html',
      'head',
      'body',
      'title',
      'meta',
      'h1',
      'h2',
      'h3',
      'h4',
      'p',
      'div',
      'span',
      'section',
      'article',
      'header',
      'footer',
      'main',
      'nav',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'br',
      'hr',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],

    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },

    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,

    disallowedTagsMode: 'discard',
  });
}
