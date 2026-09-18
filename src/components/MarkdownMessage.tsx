'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

// ============================================================================
// Message renderer.
// The advisor answers are written in a tiny markdown dialect: **bold**,
// - bullets and [label](url) links. Raw symbols should never reach the student,
// so every line is parsed and rendered as native text, chips and pills.
// ============================================================================

type Token = { kind: 'text' | 'bold' | 'link'; value: string; url?: string };

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

function tokenize(line: string): Token[] {
  const parts = line.split(INLINE).filter((p) => p !== '');
  return parts.map((part) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) return { kind: 'bold', value: bold[1] };
    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
    if (link) return { kind: 'link', value: link[1], url: link[2] };
    return { kind: 'text', value: part };
  });
}

function LinkPill({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 mt-1.5 mr-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] border border-indigo-200 transition align-middle"
    >
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
      <span className="max-w-[190px] truncate">{label}</span>
    </a>
  );
}

function Inline({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => {
        if (t.kind === 'link') return <LinkPill key={i} label={t.value} url={t.url ?? '#'} />;
        if (t.kind === 'bold')
          return (
            <strong key={i} className="font-bold">
              {t.value}
            </strong>
          );
        return <React.Fragment key={i}>{t.value}</React.Fragment>;
      })}
    </>
  );
}

export function MarkdownMessage({ text, sender }: { text: string; sender: 'ai' | 'user' }) {
  const lines = text.split('\n');

  if (sender === 'user') {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  return (
    <>
      {lines.map((rawLine, idx) => {
        const line = rawLine.replace(/\s+$/, '');
        const tokens = tokenize(line);

        if (line.trim() === '') return <div key={idx} className="h-1.5" />;

        const bulletMatch = /^[-•]\s+(.*)$/.exec(line);
        if (bulletMatch) {
          const bulletTokens = tokenize(bulletMatch[1]);
          const isLinkLine = bulletTokens.length === 1 && bulletTokens[0].kind === 'link';
          if (isLinkLine) {
            return (
              <div key={idx} className="flex justify-start">
                <Inline tokens={bulletTokens} />
              </div>
            );
          }
          return (
            <div key={idx} className="flex gap-1.5 items-start my-0.5">
              <span className="mt-0.5 text-indigo-500 font-bold leading-relaxed">•</span>
              <p className="text-[11px] leading-relaxed flex-1">
                <Inline tokens={bulletTokens} />
              </p>
            </div>
          );
        }

        const onlyLinks = tokens.every((t) => t.kind === 'link' || t.value.trim() === '');
        if (onlyLinks && tokens.some((t) => t.kind === 'link')) {
          return (
            <div key={idx} className="flex flex-wrap">
              <Inline tokens={tokens} />
            </div>
          );
        }

        return (
          <p key={idx} className="text-[11px] leading-relaxed my-0.5">
            <Inline tokens={tokens} />
          </p>
        );
      })}
    </>
  );
}