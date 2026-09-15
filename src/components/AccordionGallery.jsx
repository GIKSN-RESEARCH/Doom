 /* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect, useState } from 'react';

import { NeuralTunnel } from './neural-tunnel';
import './AccordionGallery.css';

const DEFAULT_ITEMS = [
  {
    background: 'design-field',
    label: 'Design',
    link: '#',
    copy: [
      'We design systems that actually work in the real world. Not just pretty screens.',
      'Most interfaces look fine in Figma but fall apart with real users. We fix that. We design products and tools with clarity first so they are faster to understand and easier to use.',
      'The result should feel sharp, intentional and hard to break. No decorative fluff.'
    ]
  },
  {
    background: 'engineering-field',
    label: 'Engineering',
    link: '#',
    copy: [
      'We build the actual product. Clean code. Reliable systems. Things that ship and keep working.',
      'A lot of engineering is held together with temporary fixes and unclear architecture. We do the opposite. We write structured, maintainable code built for the long run.',
      'You get systems that are easier to own, easier to improve and less likely to break under real load.'
    ]
  },
  {
    background: 'marketing-field',
    label: 'Marketing',
    link: '#',
    status: 'Coming Soon',
    copy: [
      'Most marketing still runs on old habits. Generic content. Disconnected tools. Campaigns that look busy but move nothing.',
      'We treat marketing as a system. Clearer positioning. Stronger messaging. Channels that bring the right people in.',
      'Everything is built to compound so the work gets more effective over time instead of needing a restart every few months.'
    ]
  },
  {
    background: 'micro-field',
    label: 'Micro Products',
    link: '#',
    copy: [
      'These are small, focused tools built to solve one clear problem extremely well.',
      'Not every problem needs a full platform. Sometimes the highest leverage move is a sharp limited product that does one job better than anything else.',
      'They are fast to ship, easy to understand and designed to create immediate value. The scope stays tight on purpose.'
    ]
  },
  {
    background: 'suites-field',
    label: 'Product Suites',
    link: '#',
    copy: [
      'This is the full stack. Multiple connected products and systems working as one.',
      'Some problems are too large for a single tool. They need a set of products that talk to each other and remove friction across an entire workflow.',
      'We build these as coherent systems. Every part should feel like it belongs together and reduce the total work the team has to manage.'
    ]
  }
];

const TUNNEL_COLORS = {
  'design-field': { hotColor: '#9400FF', color: '#190a24' },
  'engineering-field': { hotColor: '#08CB00', color: '#0b240a' },
  'marketing-field': { hotColor: '#00F7FF', color: '#0a2324' },
  'micro-field': { hotColor: '#FF9D23', color: '#24180a' },
  'suites-field': { hotColor: '#FFED00', color: '#24220a' }
};

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  trigger = 'hover',
  showLabels = true,
  className = ''
}) => {
  const rootRef = useRef(null);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  /* Flex-grow weight for the expanded panel */
  const growValue = (() => {
    const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
    return count > 1 ? (r * (count - 1)) / (1 - r) : 1;
  })();

  /* Map the GSAP-style ease name to a CSS bezier so the public API is kept */
  const EASE_MAP = {
    'power2.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'power3.out': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    'power4.out': 'cubic-bezier(0.165, 0.84, 0.44, 1)'
  };
  const cssEase = EASE_MAP[ease] ?? 'cubic-bezier(0.22, 1, 0.36, 1)';

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = (entries) => {
      let total = 0;
      if (entries && entries[0]) {
        total = vertical ? entries[0].contentRect.height : entries[0].contentRect.width;
      } else {
        total = vertical ? el.clientHeight : el.clientWidth;
      }
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(680, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.35);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${Math.round(size)}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap, count, expandRatio, vertical]);

  const handleEnter = i => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i, e) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-dur': `${duration}s`,
        '--ag-ease': cssEase,
        '--ag-parallax': parallax,
        '--ag-radius': `${radius}px`,
        height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`
      }}
      role="list"
      aria-label="Services accordion"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = item.link && item.link !== '#' ? 'a' : 'div';
        const ExtraBg = item.Background;
        const numStr = `0${i + 1}`;
        const hotColor = TUNNEL_COLORS[item.background]?.hotColor || '#e879f9';

        return (
          <Tag
            key={i}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{
              borderRadius: `${radius}px`,
              flexGrow: isActive ? growValue : 1,
              '--panel-hot': hotColor,
              '--panel-base': TUNNEL_COLORS[item.background]?.color || '#120408'
            }}
            href={item.link && item.link !== '#' ? item.link : undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            {/* Background & Shader Layer */}
            <span className="ag-panel__frame">
              {ExtraBg && (
                <ExtraBg
                  className="ag-panel__fx"
                  accentColor="#e07a93"
                  lineColor="#fff2f2"
                  mutedColor="#8a7377"
                />
              )}
              {TUNNEL_COLORS[item.background] && (
                <>
                  <span className="ag-panel__shader-fallback" aria-hidden="true" />
                  {isActive && (
                    <NeuralTunnel
                      className="ag-panel__fx"
                      active
                      paused={prefersReduced}
                      cursorInteraction={!prefersReduced}
                      {...TUNNEL_COLORS[item.background]}
                    />
                  )}
                </>
              )}
              {!item.background && !item.Background && (
                <span
                  className="ag-panel__media"
                  style={{ '--ag-drift': Math.max(-1.5, Math.min(1.5, active - i)) }}
                >
                  <img src={item.image} alt={item.alt || item.label || ''} draggable="false" />
                </span>
              )}
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>

            {/* Inactive vertical text indicator */}
            {showLabels && (
              <span className="ag-panel__vtext" aria-hidden="true">
                <span className="ag-panel__vtext-num">{numStr}</span>
                <span className="ag-panel__vtext-inner">{item.label}</span>
              </span>
            )}

            {/* Active Content Shell */}
            <div className="ag-panel__content" aria-hidden={!isActive}>
              {/* Top-Right Status Badge (e.g., "Coming Soon") */}
              {item.status && (
                <div className="ag-panel__status-badge">
                  <span className="ag-panel__status-dot" aria-hidden="true" />
                  <span>{item.status}</span>
                </div>
              )}

              <div className="ag-panel__content-inner">
                {/* Category / Index Badge */}
                <div className="ag-panel__header">
                  <div className="ag-panel__badge">
                    <span className="ag-panel__badge-num">{numStr}</span>
                    <span className="ag-panel__badge-dot" aria-hidden="true" />
                    <span className="ag-panel__badge-title">SERVICE</span>
                  </div>

                  {/* Kinetic Character-Split Headline */}
                  <h3 className="ag-panel__text" aria-label={item.label}>
                    <span className="ag-panel__text-mask">
                      {item.label.split(' ').map((word, wi, arr) => (
                        <span key={wi} className="ag-panel__word-wrap">
                          {word.split('').map((char, ci) => (
                            <span
                              key={ci}
                              className="ag-panel__char"
                              style={{ '--char-idx': wi * 6 + ci }}
                            >
                              {char}
                            </span>
                          ))}
                          {wi < arr.length - 1 && (
                            <span className="ag-panel__space">&nbsp;</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </h3>
                </div>

                {/* Body Paragraphs with staggered reveal */}
                {item.copy?.length > 0 && (
                  <div className="ag-panel__copy">
                    {item.copy.map((para, pi) => (
                      <div key={pi} className="ag-panel__para-mask">
                        <p
                          className={pi === 0 ? 'ag-panel__lede' : undefined}
                          style={{ '--para-idx': pi }}
                        >
                          {para}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
