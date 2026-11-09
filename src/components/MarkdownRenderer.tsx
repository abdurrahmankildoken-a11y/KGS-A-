import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy, Code2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Extract and replace code blocks with interactive copyable components
  // We can do this cleanly by parsing content into chunks (code blocks vs markdown blocks)
  const renderFormatted = () => {
    // Regex to split markdown by code blocks: ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let key = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      // Text before code block
      if (matchIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, matchIndex);
        parts.push(
          <div
            key={`text-${key++}`}
            className="prose-content leading-relaxed text-[#e3e3e3]"
            dangerouslySetInnerHTML={{
              __html: marked.parse(textBefore, { breaks: true, gfm: true }) as string,
            }}
          />
        );
      }

      const lang = match[1] || 'kod';
      const code = match[2];
      parts.push(<CodeBlock key={`code-${key++}`} language={lang} code={code} />);

      lastIndex = matchIndex + match[0].length;
    }

    // Remaining text after last code block
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      parts.push(
        <div
          key={`text-${key++}`}
          className="prose-content leading-relaxed text-[#e3e3e3]"
          dangerouslySetInnerHTML={{
            __html: marked.parse(remainingText, { breaks: true, gfm: true }) as string,
          }}
        />
      );
    }

    return parts;
  };

  return (
    <div className="markdown-body space-y-3 text-[15px] max-w-none text-neutral-200">
      {renderFormatted()}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Kopyalama hatası:', e);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-neutral-700/60 bg-[#1e1f20] shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#282a2c] border-b border-neutral-700/50 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase tracking-wider font-semibold text-neutral-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-neutral-300 hover:text-white hover:bg-neutral-700/70 transition-colors"
          title="Kodu Kopyala"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-sm font-mono text-neutral-200 leading-normal selection:bg-blue-600/40">
        <pre className="m-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
