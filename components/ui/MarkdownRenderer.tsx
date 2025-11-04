import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-3 space-y-1">
            {listItems.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: parseInlineFormatting(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      // Headers using Regex for robustness
      const h3Match = line.match(/^###\s+(.*)/);
      if (h3Match) {
        flushList();
        elements.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: parseInlineFormatting(h3Match[1]) }} />);
        return;
      }

      const h2Match = line.match(/^##\s+(.*)/);
      if (h2Match) {
        flushList();
        elements.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-5 mb-3" dangerouslySetInnerHTML={{ __html: parseInlineFormatting(h2Match[1]) }} />);
        return;
      }
      
      const h1Match = line.match(/^#\s+(.*)/);
      if (h1Match) {
        flushList();
        elements.push(<h1 key={`h1-${index}`} className="text-2xl font-extrabold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: parseInlineFormatting(h1Match[1]) }} />);
        return;
      }

      // List items using Regex
      const listItemMatch = line.match(/^\s*[\*\-]\s+(.*)/);
      if (listItemMatch) {
        listItems.push(listItemMatch[1]);
        return;
      }

      // If it's not a special line, flush any pending list and render a paragraph
      flushList();
      if (line.trim().length > 0) {
        elements.push(<p key={`p-${index}`} className="my-2" dangerouslySetInnerHTML={{ __html: parseInlineFormatting(line) }} />);
      }
    });

    flushList(); // Flush any remaining list items at the end

    return elements;
  };

  return <>{renderContent()}</>;
};

export default MarkdownRenderer;