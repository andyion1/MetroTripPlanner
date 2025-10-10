import { useState, useEffect, useRef } from 'react';
import './Map.css';

const wikiCache = new Map();

export default function WikiSummary({ name }) {
  const [summary, setSummary] = useState('Loading Wikipedia summary...');
  const [pageUrl, setPageUrl] = useState('');
  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const cleaned = name.replace(/^Station\s+/i, '').replace(/\s+/g, '_').replace(/-_/g, '-');
    const query = `${cleaned}_Station`;

    async function fetchWiki() {
      if (wikiCache.has(query)) {
        const { summary, pageUrl } = wikiCache.get(query);
        setSummary(summary);
        setPageUrl(pageUrl);
        return;
      }

      try {
        const url =
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
          `&list=search&formatversion=2&srsearch=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
          headers: { 'Api-User-Agent': 'andy.ionita@dawsoncollege.qc.ca' },
        });
        const data = await res.json();

        const first = data?.query?.search?.[0];
        if (first) {
          const summaryText = first.snippet.replace(/<\/?[^>]+(>|$)/g, '') + '…';
          const page = `https://en.wikipedia.org/?curid=${first.pageid}`;
          setSummary(summaryText);
          setPageUrl(page);
          wikiCache.set(query, { summary: summaryText, pageUrl: page });
        } else {
          setSummary('No Wikipedia summary found.');
          wikiCache.set(query, { summary: 'No Wikipedia summary found.', pageUrl: '' });
        }
      } catch {
        setSummary('Error loading summary.');
      }
    }

    fetchWiki();
  }, [name]);

  return (
    <div className="wiki-summary">
      <strong>{name}</strong>
      <p className="wiki-summary-text" dangerouslySetInnerHTML={{ __html: summary }} />
      {pageUrl &&
        <p>
          <a href={pageUrl} target="_blank" rel="noreferrer" className="wiki-summary-link">
            Read more on Wikipedia
          </a>
        </p>
      }
    </div>
  );
}
