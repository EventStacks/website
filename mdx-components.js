/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import YouTube from 'react-youtube';
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
        } mt-8 mb-6 font-sans antialiased font-medium text-2xl`}
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        className={`${
          props.className || ''
        } mt-8 mb-4 font-sans antialiased font-medium text-xl`}
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        className={`${
          props.className || ''
        } mt-6 mb-4 font-sans antialiased font-medium text-lg`}
      />
    ),
    h4: (props) => (
      <h4
        {...props}
        className={`${
          props.className || ''
        } mt-6 mb-3 font-sans antialiased font-medium text-lg text-gray-500`}
      />
    ),
    h5: (props) => (
      <h5
        {...props}
        className={`${
          props.className || ''
        } mt-6 mb-3 font-sans antialiased text-md font-bold`}
      />
    ),
    h6: (props) => (
      <h6
        {...props}
        className={`${
          props.className || ''
        } mt-6 mb-3 font-sans antialiased text-sm font-bold text-gray-500 uppercase`}
      />
    ),
    blockquote: (props) => (
      <blockquote
        {...props}
        className={`${
          props.className || ''
        } italic font-sans antialiased text-base p-6 my-6`}
        style={{
          borderLeft: '4px solid #9ca3af',
          color: '#374151',
          fontStyle: 'italic'
        }}
      />
    ),
    p: (props) => (
      <p
        {...props}
        className={`${
          props.className || ''
        } mb-6 text-gray-700 font-normal font-sans antialiased leading-loose`}
      />
    ),
    br: (props) => (
      <br {...props} className="my-4" />
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
        } my-6 pl-8 list-disc list-inside marker:text-blue-500 text-gray-700 font-normal font-sans antialiased space-y-3`}
        style={{ display: 'block', listStyleType: 'disc', listStylePosition: 'inside' }}
      />
    ),
    ol: (props) => (
      <ol
        {...props}
        className={`${
          props.className || ''
        } my-6 pl-8 list-decimal list-inside marker:text-blue-500 marker:font-bold text-gray-700 font-normal font-sans antialiased space-y-3`}
        style={{ display: 'block', listStyleType: 'decimal', listStylePosition: 'inside' }}
      />
    ),
    li: (props) => (
      <li
        {...props}
        className={`${
          props.className || ''
        } text-gray-700 font-normal font-sans antialiased leading-loose`}
        style={{ display: 'list-item' }}
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
        } my-8 max-w-full h-auto`}
      />
    ),
    hr: (props) => (
      <hr {...props} className={`${props.className || ''} my-12 border-gray-300`} />
    ),
    inlineCode: (props) => (
      <code
        {...props}
        className={`${
          props.className || ''
        } px-2 py-1 rounded font-mono text-sm font-semibold`}
        style={{ backgroundColor: '#1f2937', color: '#f9a8d4' }}
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
            } px-2 py-1 rounded font-mono text-sm font-semibold`}
            style={{ backgroundColor: '#1f2937', color: '#f9a8d4' }}
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
        <div className="mt-8 mb-12">
          <CodeBlock
            {...rest}
            caption={caption}
            className={`${className || ''} rounded`}
            language={language}
            showLineNumbers={children.split('\n').length > 2}
          >
            {children}
          </CodeBlock>
        </div>
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
  };
}
