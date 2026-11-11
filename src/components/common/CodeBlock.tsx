import { forwardRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { Badge } from './Badge';

interface CodeBlockProps {
  json: unknown;
  language?: 'json' | 'http' | 'typescript' | 'javascript';
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  maxHeight?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ json, language = 'json', title, collapsible = true, defaultCollapsed = false, maxHeight = '400px', showLineNumbers = false, className, ...props }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [copied, setCopied] = useState(false);

    const formattedJson = typeof json === 'string' ? json : JSON.stringify(json, null, 2);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(formattedJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };

    if (isCollapsed) {
      return (
        <div ref={ref} className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)} {...props}>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer" onClick={() => setIsCollapsed(false)}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Code className="w-4 h-4" />
              <span>{title || `${language.toUpperCase()} (collapsed)`}</span>
              <Badge variant="gray" size="sm">{formattedJson.length} chars</Badge>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)} {...props}>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Code className="w-4 h-4" />
            <span>{title || language.toUpperCase()}</span>
            <Badge variant="gray" size="sm">{formattedJson.length} chars</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} aria-label="Copy to clipboard">
              {copied ? <span className="text-xs text-green-600">Copied!</span> : <Copy className="w-4 h-4" />}
            </Button>
            {collapsible && (
              <button onClick={() => setIsCollapsed(true)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Collapse">
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="relative" style={{ maxHeight }}>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            lineNumberStyle={{ color: '#858585' }}
            wrapLines={true}
            customStyle={{
              fontSize: '13px',
              lineHeight: '1.5',
              padding: '16px',
              maxHeight: maxHeight,
              overflow: 'auto',
            }}
          >
            {formattedJson}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';