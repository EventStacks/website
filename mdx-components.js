/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import YouTube from 'react-youtube';
import {
  TwitterTimelineEmbed,
  TwitterShareButton,
  TwitterFollowButton,
  TwitterHashtagButton,
  TwitterMentionButton,
  TwitterTweetEmbed,
  TwitterMomentShare,
  TwitterDMButton,
  TwitterVideoEmbed,
  TwitterOnAirButton,
} from 'react-twitter-embed';
import Button from './components/buttons/Button';
import ChapterSuggestions from './components/buttons/ChapterSuggestions';
import CodeBlock from './components/editor/CodeBlock';
import Remember from './components/Remember';
import Warning from './components/Warning';
import Caption from './components/Caption';
import Row from './components/layout/Row';
import Column from './components/layout/Column';
import Figure from './components/Figure';

export function useMDXComponents(components) {
  return {
    ...components,
    h1: (props) => (
      <h1
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased font-medium text-2xl`}
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased font-medium text-xl`}
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased font-medium text-lg`}
      />
    ),
    h4: (props) => (
      <h4
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased font-medium text-lg text-gray-500`}
      />
    ),
    h5: (props) => (
      <h5
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased text-md font-bold`}
      />
    ),
    h6: (props) => (
      <h6
        {...props}
        className={`${
          props.className || ''
        } my-4 font-sans antialiased text-sm font-bold text-gray-500 uppercase`}
      />
    ),
    blockquote: (props) => (
      <blockquote
        {...props}
        className={`${
          props.className || ''
        } italic font-sans antialiased text-gray-400 border-l-4 border-gray-400 pl-4 pt-1 pb-1 pr-1 my-4 bg-white`}
      />
    ),
    p: (props) => (
      <p
        {...props}
        className={`${
          props.className || ''
        } my-4 text-gray-700 font-normal font-sans antialiased`}
      />
    ),
    strong: (props) => (
      <strong
        {...props}
        className={`${
          props.className || ''
        } my-4 text-gray-700 font-semibold font-sans antialiased`}
      />
    ),
    a: (props) => (
      <a
        {...props}
        className={`${
          props.className
            ? props.className
            : 'text-primary-600 font-medium hover:text-primary-500'
        } font-sans antialiased`}
      />
    ),
    ul: (props) => (
      <ul
        {...props}
        className={`${
          props.className || ''
        } my-4 ml-4 list-disc text-gray-700 font-normal font-sans antialiased`}
      />
    ),
    ol: (props) => (
      <ol
        {...props}
        className={`${
          props.className || ''
        } my-4 ml-4 list-decimal text-gray-700 font-normal font-sans antialiased`}
      />
    ),
    li: (props) => (
      <li
        {...props}
        className={`${
          props.className || ''
        } my-2 text-gray-700 font-normal font-sans antialiased`}
      />
    ),
    table: (props) => (
      <table
        {...props}
        className={`${
          props.className || ''
        } my-4 table-auto w-full text-gray-700 font-normal font-sans antialiased`}
      />
    ),
    thead: (props) => (
      <thead
        {...props}
        className={`${
          props.className || ''
        } bg-gray-100 text-gray-900 font-semibold`}
      />
    ),
    tbody: (props) => (
      <tbody
        {...props}
        className={`${
          props.className || ''
        } divide-y divide-gray-200`}
      />
    ),
    tr: (props) => (
      <tr
        {...props}
        className={`${
          props.className || ''
        } hover:bg-gray-50`}
      />
    ),
    th: (props) => (
      <th
        {...props}
        className={`${
          props.className || ''
        } px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
      />
    ),
    td: (props) => (
      <td
        {...props}
        className={`${
          props.className || ''
        } px-6 py-4 whitespace-nowrap text-sm text-gray-700`}
      />
    ),
    img: (props) => (
      <img
        {...props}
        className={`${
          props.className || ''
        } my-4 max-w-full h-auto`}
      />
    ),
    hr: (props) => (
      <hr {...props} className={`${props.className || ''} my-8`} />
    ),
    inlineCode: (props) => (
      <code
        {...props}
        className={`${
          props.className || ''
        } px-1 py-0.5 bg-primary-700 text-white rounded font-mono text-sm`}
      />
    ),
    code: ({ children, className = '', metastring = '', ...rest }) => {
      const maybeLanguage = className.match(/language-([\w\d\-_]+)/);
      const language =
        maybeLanguage && maybeLanguage.length >= 2
          ? maybeLanguage[1]
          : undefined;

      // If there's no language and no newlines, it's inline code
      if (!language && typeof children === 'string' && !children.includes('\n')) {
        return (
          <code
            {...rest}
            className={`${
              className || ''
            } px-1 py-0.5 bg-primary-700 text-white rounded font-mono text-sm`}
          >
            {children}
          </code>
        );
      }

      // Otherwise, it's a code block
      let caption;
      const meta = metastring.split(/([\w]+=[\w\d\s\-_:><.]+)/) || [];
      meta.forEach((str) => {
        const params = new URLSearchParams(str);
        caption = params.get('caption') || '';
        if (caption.startsWith('\'') && caption.endsWith('\''))
          caption = caption.substring(1, caption.length - 1);
      });
      return (
        <CodeBlock
          {...rest}
          caption={caption}
          className={`${className || ''} rounded`}
          language={language}
          showLineNumbers={children.split('\n').length > 2}
        >
          {children}
        </CodeBlock>
      );
    },
    CodeBlock,
    ChapterSuggestions,
    YouTube,
    Remember,
    Warning,
    Caption,
    Row,
    Column,
    Figure,
    TwitterTimelineEmbed,
    TwitterShareButton,
    TwitterFollowButton,
    TwitterHashtagButton,
    TwitterMentionButton,
    TwitterTweetEmbed,
    TwitterMomentShare,
    TwitterDMButton,
    TwitterVideoEmbed,
    TwitterOnAirButton,
  };
}
