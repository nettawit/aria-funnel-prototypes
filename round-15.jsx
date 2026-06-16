/* ============================================================
   Aria — Home Screen Flow (11 states, one interactive prototype).
   Home: empty → (Continue) → ready.  Add dropdown → Assets /
   Extract / Reference→URL modals.  Import My Site: URL → scan →
   results (two-column).  Self-contained; WDS font/icon CSS + Aria PNG.
   ============================================================ */

const { useState: hs, useEffect: he, useRef: hr } = React;

const H_BLUE = '#2D4EE0';
const H_INK = '#1E1E2E';
const H_MUTED = '#888898';

const HAria = ({ size = 28, style, className }) =>
<img src="wds/aria-icon.svg" alt="Aria" width={size} height={size} className={className} style={{ display: 'block', objectFit: 'contain', flexShrink: 0, ...style }} />;

const HIc = ({ name, size = 16, color }) => {
  const svg = window.WdsIcon ? window.WdsIcon(name, { size }) : '';
  return <i style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, color: color || 'inherit', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />;
};

/* Harmony button base styles — fully token-driven from tokens-harmony.css
   ALL values come from CSS variables so they auto-match the loaded Harmony theme.
   Fallbacks are the resolved Harmony token values:
     tiny:   h:24 fs:12 fw:600 ph:12 lh:16 r:6
     small:  h:30 fs:12 fw:600 ph:16 lh:16 r:6
     medium: h:38 fs:14 fw:600 ph:20 lh:24 r:8
     large:  h:46 fs:16 fw:600 ph:24 lh:24 r:8  */
const hBtn = (size = 'medium') => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  height: `var(--wds-button-size-${size}, ${({tiny:24,small:30,medium:38,large:46})[size]||38}px)`,
  padding: `0 var(--wds-button-padding-horizontal-${size}, ${({tiny:12,small:16,medium:20,large:24})[size]||20}px)`,
  fontSize: `var(--wds-button-font-size-${size}, ${({tiny:12,small:12,medium:14,large:16})[size]||14}px)`,
  fontWeight: `var(--wds-button-font-weight-${size}, 600)`,
  lineHeight: `var(--wds-button-font-line-height-${size}, ${({tiny:16,small:16,medium:24,large:24})[size]||24}px)`,
  borderRadius: `var(--wds-button-border-radius-${size}, ${({tiny:6,small:6,medium:8,large:8})[size]||8}px)`,
  fontFamily: 'var(--wds-font-family-default, "Wix Madefor Text", sans-serif)',
  cursor: 'pointer', border: 0, boxSizing: 'border-box', whiteSpace: 'nowrap',
});
// Note: spread these as style={hBtnPrimary()} + className="hbtn" etc.
// Helper that returns {style, className} for JSX spread
const hBtnPrimary   = (size = 'medium') => ({ ...hBtn(size), background: '#2F5DFF', color: '#fff' });
const hBtnSecondary = (size = 'medium') => ({ ...hBtn(size), background: '#fff', color: '#32324D', border: '1px solid #E0E0E0' });
const hBtnGhost     = (size = 'medium') => ({ ...hBtn(size), background: 'transparent', color: H_BLUE, border: 0 });
// className helpers
const hCls = { primary: 'hbtn', secondary: 'hbtn hbtn-secondary', ghost: 'hbtn hbtn-ghost' };

const pill = (bg, border, color) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, border, borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500, color, cursor: 'pointer', fontFamily: 'inherit' });
const cta = { ...hBtnPrimary('large'), gap: 6 };

/* ---- headline detection logic ---- */
const BTYPE_LIST = ['store','shop','restaurant','cafe','café','bakery','agency','consultancy','consulting','studio','hub','gallery','blog','portfolio','marketplace','podcast','course','school','gym','salon','clinic','firm','practice','club','magazine','boutique','startup','hotel','tour','florist','museum','library','newsletter','landing page','coach','coaching','e-commerce','ecommerce','online store','bar','pub','spa','dental','therapy','nonprofit','charity','venue','event','wedding','fitness','yoga','dance','realtor','real estate','brokerage','marketing','design studio','tech startup','saas','service business','catering','daycare','tutoring','academy','vlog','franchise','foundation'];
const UNIQUE_LIST = ['unique','different','special','signature','specialize','dedicated','handcrafted','artisan','family-owned','sustainable','eco-friendly','premium','luxury','affordable','organic','ethical','mission','vision','custom','personalized','authentic','traditional','modern','innovative','exclusive','niche','curated','minimalist','bold','playful','focus on','focused on','we believe','featuring','highlights','highlight','showcases','showcase','target audience','known for','best known','serves','catering to','specialty','tagline','our story','our mission','aimed at'];

function detectName(t) {
  if (!t) return false;
  // Quoted name: "Bloom" or 'Bloom'
  if (/"[^"]{2,40}"/.test(t) || /'[^']{2,40}'/.test(t)) return true;
  // Explicit "called X" or "named X" or "titled X"
  if (/\b(called|named|titled)\s+[A-Z\w]/i.test(t)) return true;
  // "my store/brand/… is called/named X" — requires called/named explicitly
  if (/\bmy\s+(store|shop|business|brand|company|firm|studio|agency|cafe|restaurant|bakery|hub|website|portfolio)s?\s+is\s+(called|named)\s+\S/i.test(t)) return true;
  // "the site/brand is called/named X"
  if (/\bthe\s+(site|brand|business|store|company|shop)\s+is\s+(called|named)\s+\S/i.test(t)) return true;
  // Sentence starts with a proper noun: "Bloom Bakery is a..."
  if (/^[A-Z][A-Za-z0-9&''\-]{1,}(\s+[A-Za-z0-9&''\-]+){0,4}\s+is\s+(a|an|the)\b/.test(t.trim())) return true;
  return false;
}
function detectType(t) {
  if (!t) return false;
  const low = t.toLowerCase();
  return BTYPE_LIST.some(w => { const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b','i'); return re.test(low); });
}
function detectUnique(t) {
  if (!t) return false;
  if (t.trim().split(/\s+/).length >= 18) return true;
  const low = t.toLowerCase();
  return UNIQUE_LIST.some(w => low.includes(w));
}

const HEADLINE_STATES = {
  '000': { l1: "Hi! I'm Aria, your friendly design assistant.", l2Parts: ["Tell me your site's ", ["name"], ", what kind of ", ["business"], " it is, and what ", ["makes it unique"], "."] },
  '100': { l1: "Got it — nice start.", l2Parts: ["Now just tell me what kind of ", ["business"], " it is and what ", ["makes it unique"], "."] },
  '010': { l1: "Got it — nice start.", l2Parts: ["Now just tell me your site's ", ["name"], " and what ", ["makes it unique"], "."] },
  '001': { l1: "Got it — nice start.", l2Parts: ["Now just tell me your site's ", ["name"], " and what kind of ", ["business"], " it is."] },
  '110': { l1: "Almost there — one more thing.", l2Parts: ["Just share a little about what ", ["makes it unique"], " — what sets it apart."] },
  '101': { l1: "Almost there — one more thing.", l2Parts: ["Just tell me what kind of ", ["business"], " this is."] },
  '011': { l1: "Almost there — one more thing.", l2Parts: ["Just tell me what your site is ", ["called"], "."] },
  '111': { l1: "Perfect, I have everything I need.", l2Parts: ["I'll start sketching your site — hit Generate when you're ready."] },
};

/* ---- typewriter hook ---- */
function useTypewriter(text, speed = 22, thinkDelay = 0) {
  const [displayed, setDisplayed] = hs('');
  const prev = hr('');
  const timerRef = hr(null);
  const thinkRef = hr(null);

  he(() => {
    if (prev.current === text) return;
    prev.current = text;
    setDisplayed('');
    clearInterval(timerRef.current);
    clearTimeout(thinkRef.current);
    thinkRef.current = setTimeout(() => {
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(timerRef.current);
      }, speed);
    }, thinkDelay);
    return () => { clearInterval(timerRef.current); clearTimeout(thinkRef.current); };
  }, [text]);

  return displayed;
}

/* Typewriter title — re-animates when text changes */
function TypewriterTitle({ text, className, style }) {
  const displayed = useTypewriter(text, 20, 500);
  return <div className={className} style={style}>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0, borderLeft: '2px solid #315FFF', marginLeft: 1, display: 'inline-block', height: '0.85em', verticalAlign: 'middle', animation: 'tw-blink 0.7s step-end infinite', WebkitTextFillColor: 'initial' }} /></div>;
}

/* Typewriter body — flat text then colorize inline highlights */
function TypewriterBody({ parts, delay = 0 }) {
  const fullText = parts.map(p => Array.isArray(p) ? p[0] : p).join('');
  const [started, setStarted] = hs(delay === 0);
  he(() => { setStarted(false); const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [fullText]);
  const displayed = useTypewriter(started ? fullText : '', 14);
  let cursor = 0;
  const nodes = parts.map((p, i) => {
    const chunk = Array.isArray(p) ? p[0] : p;
    const start = cursor;
    cursor += chunk.length;
    const visible = displayed.slice(start, cursor);
    return visible ? <span key={i} style={Array.isArray(p) ? { color: '#315FFF' } : { color: '#1E1E2E' }}>{visible}</span> : null;
  });
  const done = displayed.length >= fullText.length;
  const bodyStyle = { fontFamily: '"Wix Madefor Display App","Wix Madefor Display",sans-serif', fontSize: 30, fontWeight: 400, lineHeight: '34.5px', letterSpacing: '-0.8px', whiteSpace: 'nowrap' };
  return <div style={bodyStyle}>
    {nodes}
    {!done && <span style={{ borderLeft: '2px solid #315FFF', marginLeft: 1, display: 'inline-block', height: '0.85em', verticalAlign: 'middle', animation: 'tw-blink 0.7s step-end infinite' }} />}
  </div>;
}

/* Inline typewriter with optional start delay */
function TypewriterInline({ text, color, delay = 0 }) {
  const [displayed, setDisplayed] = hs('');
  he(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text]);
  const done = displayed.length >= text.length;
  return <span style={{ color }}>
    {displayed}
    {!done && <span style={{ borderRight: `2px solid ${color}`, marginLeft: 1, display: 'inline-block', height: '0.85em', verticalAlign: 'middle', animation: 'tw-blink 0.7s step-end infinite' }} />}
  </span>;
}

function HeadlineBody({ parts }) {
  return <div style={{ fontSize: 20, fontWeight: 400, color: H_INK, lineHeight: 1.5 }}>
    {parts.map((p, i) => Array.isArray(p)
      ? <span key={i} style={{ color: H_BLUE }}>{p[0]}</span>
      : <span key={i}>{p}</span>
    )}
  </div>;
}

/* ---- Attachment chip (Figma design: node 23:840 / 23:884) ---- */
function fileExt(name) {
  const m = name.match(/\.(\w+)$/);
  return m ? m[1].toUpperCase() : 'FILE';
}
const IMG_EXTS = ['JPG','JPEG','PNG','GIF','WEBP','SVG','HEIC'];
function isImage(name) { return IMG_EXTS.includes(fileExt(name)); }

/* Real photo thumbnails via picsum — seed from filename for consistency */
function imgSrc(name) {
  const seed = encodeURIComponent(name.replace(/\.[^.]+$/, ''));
  return `https://picsum.photos/seed/${seed}/96/96`;
}

function FileIcon({ name }) {
  const ext = fileExt(name);
  const colors = { PDF: '#E53E3E', MP4: '#805AD5', MOV: '#805AD5', DOC: '#2B6CB0', DOCX: '#2B6CB0' };
  const c = colors[ext] || '#718096';
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F8F6F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
        <path d="M11 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V7L11 1Z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
        <path d="M11 1V7H17" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="9" y="15" textAnchor="middle" fontSize="5" fontWeight="700" fill={c} fontFamily="sans-serif">{ext.slice(0,4)}</text>
      </svg>
    </div>
  );
}

/* URL / globe icon */
function GlobeIcon() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F0FAF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#38A169" strokeWidth="1.3"/>
        <ellipse cx="8" cy="8" rx="2.8" ry="6.5" stroke="#38A169" strokeWidth="1.3"/>
        <path d="M1.5 6h13M1.5 10h13" stroke="#38A169" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* Close × button — shared between both chip variants */
function CloseBtn({ onRemove, transparent }) {
  return (
    <span onClick={onRemove} style={{
      position: 'absolute', top: transparent ? 2 : -6, right: transparent ? 2 : -6,
      width: 18, height: 18, borderRadius: '50%',
      background: transparent ? 'rgba(82,81,80,0.5)' : '#fff',
      border: transparent ? 'none' : '1px solid #E8E7E7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: transparent ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
        <path d="M1 1L5 5M5 1L1 5" stroke={transparent ? '#fff' : '#888898'} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

function isUrl(name) { return /^https?:\/\/|^www\.|\.com|\.io|\.co|\.net|\.org/.test(name); }

/* ---- attachment types — colored left edge per type; label lives in group headers & hover tooltip ---- */
const TYPE_BADGE = {
  asset: { label: 'Asset', fg: '#C05B2A' },
  ref:   { label: 'Reference', fg: '#6040D0' },
  file:  { label: 'Info', fg: '#1A6CC0' },
  site:  { label: 'Site', fg: '#44455A' },
};
const typeEdge = (type) => type ? { border: '1px solid #E8E7E7', borderLeft: `3px solid ${TYPE_BADGE[type].fg}` } : { border: '1px solid #E8E7E7' };

function AttachmentChip({ name, onRemove, type }) {
  const [hovered, setHovered] = hs(false);
  const hoverProps = onRemove ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } : {};
  const tip = type ? TYPE_BADGE[type].label : undefined;

  /* URL variant — globe icon */
  if (isUrl(name)) {
    const display = name.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return (
      <span {...hoverProps} title={tip} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#fff', ...typeEdge(type), borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: onRemove ? 16 : 10 }}>
          <GlobeIcon />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#151414', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{display}</span>
        </span>
        {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={false} />}
      </span>
    );
  }

  /* Image variant — 48×48 thumbnail with type edge */
  if (isImage(name)) {
    return (
      <span {...hoverProps} title={tip} style={{ position: 'relative', display: 'inline-flex', width: 48, height: 48, borderRadius: 8, ...(type ? typeEdge(type) : { border: '1px solid rgba(19,23,32,0.1)' }), overflow: 'hidden', flexShrink: 0, boxSizing: 'border-box', background: '#fff' }}>
        <img src={imgSrc(name)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={true} />}
      </span>
    );
  }

  /* File variant — Figma node 23:840 */
  return (
    <span {...hoverProps} title={tip} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#fff', ...typeEdge(type), borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: onRemove ? 16 : 10 }}>
        <FileIcon name={name} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#151414', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      </span>
      {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={false} />}
    </span>
  );
}

/* ---- folder chip (10+ files) ---- */
function FolderChip({ files, onRemoveFile }) {
  const [open, setOpen] = hs(false);
  return (
    <span style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ height: 36, padding: '0 12px', borderRadius: 'var(--wds-button-border-radius-medium, 8px)', background: open ? '#EEF4FF' : '#F5F6FA', border: `1px solid ${open ? '#116DFF' : '#E0E0E8'}`, color: open ? '#116DFF' : '#32324D', fontSize: 14, fontWeight: 530, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 120ms, border-color 120ms, color 120ms', fontFamily: 'var(--wds-font-family-default, "Wix Madefor Text", sans-serif)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3.5C1 2.67 1.67 2 2.5 2H5.25L6.75 3.5H11.5C12.33 3.5 13 4.17 13 5V10.5C13 11.33 12.33 12 11.5 12H2.5C1.67 12 1 11.33 1 10.5V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
        +{files.length} more
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: '#fff', borderRadius: 10, border: '1px solid #E8E7E7', boxShadow: '0 4px 20px rgba(0,0,0,0.10)', padding: 6, minWidth: 220, zIndex: 40, animation: 'h-menu 140ms ease-out' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px 4px' }}>{files.length} files</div>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6 }}>
              <FileIcon name={f} />
              <span style={{ flex: 1, fontSize: 12, color: '#32324D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
              <button onClick={() => onRemoveFile(i)} style={{ border: 0, background: 'none', cursor: 'pointer', color: '#AAAAAA', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

/* ---- imported site chip (Create from URL result) ---- */
function SiteChip({ site, onRemove }) {
  const [hovered, setHovered] = hs(false);
  const [favErr, setFavErr] = hs(false);
  return (
    <span onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} title="Site" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#fff', ...typeEdge('site'), borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: onRemove ? 16 : 10 }}>
        {favErr ? <GlobeIcon /> : <img src={`https://www.google.com/s2/favicons?domain=${site.host}&sz=64`} alt="" width={20} height={20} onError={() => setFavErr(true)} style={{ borderRadius: 4, display: 'block', flexShrink: 0 }} />}
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#151414', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{site.host}</span>
          <span style={{ fontSize: 10, color: '#888898', whiteSpace: 'nowrap' }}>{site.mode === 'design' ? 'Design only' : 'Content & design'}</span>
        </span>
        {site.isShopify && <span style={{ background: '#EDFAF3', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#1A8A5A', flexShrink: 0 }}>Shopify</span>}
      </span>
      {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={false} />}
    </span>
  );
}

/* ---- template thumbnails ---- */
const WIX_TPL = 'https://images-wixmp-530a50041672c69d335ba4cf.wixmp.com/templates/image/';
function TplImg({ id }) {
  const [loaded, setLoaded] = hs(false);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#e8eaf6 25%,#d0d4f0 50%,#e8eaf6 75%)', backgroundSize: '200% 100%', animation: 'h-shimmer 1.4s linear infinite' }} />}
      <img src={`${WIX_TPL}${id}/v1/fill/w_536%2Ch_302%2Cq_90%2Cusm_0.60_1.00_0.01/${id}`} onLoad={() => setLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 300ms ease' }} />
    </div>
  );
}

function TBrowser({ bar = '#fff', children }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 18, background: bar, display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: ['#FF5F57','#FEBC2E','#28C840'][i] }} />)}
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

/* allTpls entries: [displayName, imageId] — every entry is a unique real Wix template image */
const TPL_GENERAL = [
  ['Beauty Shop',           '8ea8430a-abb2-45b7-9597-071759b52c6d.jpg'],
  ['Graphic Designer',      'f7754d35-c806-409c-bd7f-8f6d75271ce7.jpg'],
  ['Therapist',             '23efb7879de69df547c48ff84fa42681ca8f684fc5d2916d931caec3fed8ee401770562294509.jpg'],
  ['Financial Consulting',  'e9dcaa69-7c19-4682-a51f-fee7251b8e67.jpg'],
  ['Hair Salon',            '93ab28ec-4409-4621-a261-44ddbb2369db.jpg'],
  ['Wellness Shop',         '65b05b3b-b9ff-4f79-a1f8-a3c726dd47e0.jpg'],
  ['Japanese Restaurant',   '75c4c04a-d83e-40ae-aa5d-c7c1553ea6da.jpg'],
  ['Branding Portfolio',    'a132e872-a8c0-4baf-bd6d-6e2eb1d1f004.jpg'],
  ['Construction Co.',      'ce7952dd-2548-4852-bfed-a4acb6a5465c.jpg'],
];
const TPL_FASHION = [
  ['Fashion Designer',      '49051db8-b1ca-4c92-a412-434bb6611701.jpg'],
  ['Hair Extensions Salon', '93ab28ec-4409-4621-a261-44ddbb2369db.jpg'],
  ['Beauty Shop',           '8ea8430a-abb2-45b7-9597-071759b52c6d.jpg'],
  ['Branding Portfolio',    'a132e872-a8c0-4baf-bd6d-6e2eb1d1f004.jpg'],
  ['Interior Designer',     '4d121948-c889-4cc4-9f84-367f7240d465.jpg'],
  ['Art Supply Store',      '74eb1530-1231-4f5d-b153-7581226ecc8d.jpg'],
  ['Home Goods Store',      '89cac140e103a6f04947629c1e0ddd8487e61f5b7e29615f5c33ea5936e0ce971771232421387.jpg'],
  ['Baby Gift Store',       '73b8521c-b8aa-422c-81fc-069a39070bde.jpg'],
  ['Wellness Shop',         '65b05b3b-b9ff-4f79-a1f8-a3c726dd47e0.jpg'],
];
const TPL_WELLNESS = [
  ['Therapist',             '23efb7879de69df547c48ff84fa42681ca8f684fc5d2916d931caec3fed8ee401770562294509.jpg'],
  ['Wellness Shop',         '65b05b3b-b9ff-4f79-a1f8-a3c726dd47e0.jpg'],
  ['Home Healthcare',       'e32b83755aff711096a3237cd19b3b265ead5de1dcd9df46b6d9437b1dac203a1770561624889.jpg'],
  ['Juice Bar',             'bbe92ffe-6199-40b4-a0ae-7082f553463a.jpg'],
  ['Catering (Green)',      '2382126d-226a-48b4-b0f7-e1015d0d783d.jpg'],
  ['Beauty Shop',           '8ea8430a-abb2-45b7-9597-071759b52c6d.jpg'],
  ['Hair Salon',            '93ab28ec-4409-4621-a261-44ddbb2369db.jpg'],
  ['Landscaping',           '02860d32cea6cd516fdf112fb5a100aac000117ea0329279a4be509b4d3876721770562288401.jpg'],
  ['Pastry Shop',           '4d4797e1-23e2-45f5-b115-88f3c987278b.jpg'],
];
const TPL_FOOD = [
  ['Pastry Shop',           '4d4797e1-23e2-45f5-b115-88f3c987278b.jpg'],
  ['Japanese Restaurant',   '75c4c04a-d83e-40ae-aa5d-c7c1553ea6da.jpg'],
  ['Café',                  '0a729595-11d1-457b-bb96-27c06adc35d7.jpg'],
  ['Chef',                  '708e6a12-9bc9-46fc-91eb-31fa820ee7c1.jpg'],
  ['Bar',                   'f241e57a-6422-45fd-8239-33d3bb42b9fa.jpg'],
  ['Juice Bar',             'bbe92ffe-6199-40b4-a0ae-7082f553463a.jpg'],
  ['Food Catering',         '0da360b3-1d68-40f0-89de-1d1e6fd1f525.jpg'],
  ['Private Chef',          'd813073c-6835-4038-9988-f525a4ff176d.jpg'],
  ['Brasserie',             '10a8fe488fcc33f4f41d1544be19495f9e2ee76da135597345df57023a6ae5df1768495118529.jpg'],
];
const TPL_PORTFOLIO = [
  ['Graphic Designer',      'f7754d35-c806-409c-bd7f-8f6d75271ce7.jpg'],
  ['Artist',                'fe1f293a10f4968c9fded0ced8750fd0b0180be73fbb3a18da1d73bdee7caeda1770561441387.jpg'],
  ['Travel Photographer',   '3c5d85e7-70d8-41cb-bacb-c2a28e450483.jpg'],
  ['Branding Portfolio',    'a132e872-a8c0-4baf-bd6d-6e2eb1d1f004.jpg'],
  ['Interior Designer',     '4d121948-c889-4cc4-9f84-367f7240d465.jpg'],
  ['Fashion Designer',      '49051db8-b1ca-4c92-a412-434bb6611701.jpg'],
  ['Wedding Photographer',  'e98639e0-19dc-4cf7-a297-1d149104a74c.jpg'],
  ['Photographer',          '05c734ce-f92b-4062-97d7-0c5094a313c1.jpg'],
  ['Architect Portfolio',   'e48aa533-b8ae-4b74-ae1d-8d1312f1a749.jpg'],
];
const TPL_STORE = [
  ['Beauty Shop',           '8ea8430a-abb2-45b7-9597-071759b52c6d.jpg'],
  ['Wellness Shop',         '65b05b3b-b9ff-4f79-a1f8-a3c726dd47e0.jpg'],
  ['Art Supply Store',      '74eb1530-1231-4f5d-b153-7581226ecc8d.jpg'],
  ['Pet Supply Store',      '4426b0b4-930c-40bd-b3dd-fbf31dbaed16.jpg'],
  ['Home Goods Store',      '89cac140e103a6f04947629c1e0ddd8487e61f5b7e29615f5c33ea5936e0ce971771232421387.jpg'],
  ['Baby Gift Store',       '73b8521c-b8aa-422c-81fc-069a39070bde.jpg'],
  ['Ice Cream Shop',        'b8b6a95a-5f98-4e3b-b2c0-625a21e8e748.jpg'],
  ['Toy Store',             '8bbed02a-b682-4fce-91d9-f6ae7607c9d2.jpg'],
  ['Hair Extensions Salon', '93ab28ec-4409-4621-a261-44ddbb2369db.jpg'],
];
const TPL_BUSINESS = [
  ['Financial Consulting',  'e9dcaa69-7c19-4682-a51f-fee7251b8e67.jpg'],
  ['Construction Co.',      'ce7952dd-2548-4852-bfed-a4acb6a5465c.jpg'],
  ['Home Remodeling',       '19ff0058f81692e03f54457b102fb50f1d3b581390cffaa9138d443b7d63c63f1771232583128.jpg'],
  ['Interior Design Co.',   '9acfada09563a369ecef5d82216ad7351ea135ccc5fb0b1233f196a259a25a0d1770561593038.jpg'],
  ['Landscaping',           '02860d32cea6cd516fdf112fb5a100aac000117ea0329279a4be509b4d3876721770562288401.jpg'],
  ['Home Healthcare',       'e32b83755aff711096a3237cd19b3b265ead5de1dcd9df46b6d9437b1dac203a1770561624889.jpg'],
  ['Car Detailing',         'e74000c8-ba68-47df-aa3c-eaf7da926545.jpg'],
  ['Branding Portfolio',    'a132e872-a8c0-4baf-bd6d-6e2eb1d1f004.jpg'],
  ['Architect Portfolio',   'e48aa533-b8ae-4b74-ae1d-8d1312f1a749.jpg'],
];


/* ---- chips shown inside the card in content/ready states ---- */
function AssetChip() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF8EE', border: '1px solid #F0D8A8', borderRadius: 20, padding: '4px 10px' }}>
      <HIc name="edit" size={12} color="#C07020" />
      <span style={{ fontSize: 12, fontWeight: 500, color: H_INK }}>logo.png</span>
      <span style={{ fontSize: 12, color: H_MUTED, marginLeft: 2 }}>· Asset</span>
      <span style={{ fontSize: 13, color: '#AAAAAA', marginLeft: 4, cursor: 'pointer' }}>&times;</span>
    </span>);

}
function RefChip() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EEF2FF', border: '1px solid #C8D4FF', borderRadius: 20, padding: '4px 10px' }}>
      <HIc name="link" size={12} color="#3D5ECC" />
      <span style={{ fontSize: 12, fontWeight: 500, color: H_INK }}>awwwards.com</span>
      <span style={{ fontSize: 12, color: H_MUTED, marginLeft: 2 }}>· Reference</span>
      <span style={{ fontSize: 13, color: '#AAAAAA', marginLeft: 4, cursor: 'pointer' }}>&times;</span>
    </span>);

}

function HomeFlow({ start = 'empty', onGenerate }) {
  const [screen, setScreen] = hs(start); // 'empty' | 'text' | 'ready'
  const [prompt, setPrompt] = hs('');
  const [asset, setAsset] = hs(false);
  const [assetCount, setAssetCount] = hs(1);
  const [assetFiles, setAssetFiles] = hs([]);
  const [refs, setRefs] = hs([]);
  const [importedSite, setImportedSite] = hs(null); // null | { host, isShopify, mode: 'both' | 'design' }
  const [fileTypes, setFileTypes] = hs({}); // name -> 'asset' | 'file' | 'ref'
  const recordTypes = (names, type) => setFileTypes(prev => { const m = { ...prev }; names.forEach(n => { if (!m[n]) m[n] = type; }); return m; });
  const [ov, setOv] = hs(null); // overlay/modal id
  const [refHover, setRefHover] = hs(false);
  const [scanPct, setScanPct] = hs(60);
  const [showMore, setShowMore] = hs(false);
  const [tplSearch, setTplSearch] = hs('');
  const [ideasSet, setIdeasSet] = hs(0);
  const textareaRef = hr(null);
  const [dragOver, setDragOver] = hs(false);
  const [undoItem, setUndoItem] = hs(null); // { label, restore: fn }
  const undoTimerRef = hr(null);
  const [continuing, setContinuing] = hs(false);
  const [showContinueTip, setShowContinueTip] = hs(false);
  const [emptyKey, setEmptyKey] = hs(0);
  const [placeholderKey, setPlaceholderKey] = hs(0);
  const prevPlaceholderRef = hr('');

  // Auto-focus textarea when entering text screen
  he(() => {
    if ((screen === 'text' || screen === 'empty') && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [screen]);

  const transitioning = screen === 'transitioning';
  const ready = screen === 'ready';

  // Placeholder crossfade trigger
  const placeholderText = ready ? '' : (asset || refs.length || importedSite) ? 'Add instructions, or drag in more files to guide Aria…' : 'Tell me about your site — or drag in anything that helps Aria: files, images or links…';
  he(() => {
    if (placeholderText !== prevPlaceholderRef.current) {
      prevPlaceholderRef.current = placeholderText;
      setPlaceholderKey(k => k + 1);
    }
  }, [placeholderText]);

  // Escape closes any open overlay/modal
  he(() => {
    const handler = (e) => { if (e.key === 'Escape') setOv(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const showUndo = (label, restore) => {
    clearTimeout(undoTimerRef.current);
    setUndoItem({ label, restore });
    undoTimerRef.current = setTimeout(() => setUndoItem(null), 4000);
  };

  const ALLOWED_EXTS = ['PNG','JPG','JPEG','PDF','SVG','ZIP'];
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const urlText = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (files.length) {
      const valid = files.filter(f => ALLOWED_EXTS.includes((f.name.split('.').pop() || '').toUpperCase()));
      const invalid = files.filter(f => !ALLOWED_EXTS.includes((f.name.split('.').pop() || '').toUpperCase()));
      if (valid.length) {
        const names = valid.map(f => f.name);
        setAsset(true); recordTypes(names, 'asset'); setAssetFiles(prev => { const newOnes = names.filter(n => !prev.includes(n)); return [...prev, ...newOnes]; });
        if (screen === 'empty') setScreen('text');
      }
      if (invalid.length) {
        showUndo(`${invalid.map(f => f.name).join(', ')} — unsupported format`, null);
      }
    } else if (urlText && urlText.startsWith('http')) {
      const host = urlText.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!refs.includes(host)) { setRefs(prev => [...prev, host]); if (screen === 'empty') setScreen('text'); }
    }
  };

  he(() => {}, [ov]);

  const [ariaTouch, setAriaTouch] = hs('');
  const [readyKey, setReadyKey] = hs('111'); // key at the time Continue was clicked

  const liveKey = (detectName(prompt) ? '1' : '0') + (detectType(prompt) ? '1' : '0') + (detectUnique(prompt) ? '1' : '0');
  const [stateKey, setStateKey] = hs('000');
  const [isTyping, setIsTyping] = hs(false);
  he(() => {
    // Update headline after 1.2s pause
    const t = setTimeout(() => setStateKey(liveKey), 1200);
    return () => clearTimeout(t);
  }, [liveKey]);
  he(() => {
    // isTyping — true while user is actively typing, clears 1.5s after last keystroke
    if (!prompt) { setIsTyping(false); return; }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 1500);
    return () => clearTimeout(t);
  }, [prompt]);
  const hasText = screen === 'text' || ready || transitioning;
  const hasContent = asset || refs.length > 0 || importedSite;
  const btnLabel = ready ? 'Generate Site' : 'Continue with Aria';
  // Headline: in ready state, use readyKey (not always '111')
  const readyHeadlineKey = readyKey;
  /* Static headline — Aria no longer reacts to the user's input */
  const hs_ = HEADLINE_STATES['000'];

  const buildAriaTouch = () => {
    const parts = [];
    if (asset && assetFiles.length) parts.push(`Based on your ${assetFiles.length > 1 ? assetFiles.length + ' files' : assetFiles[0]}, I'll extract your brand colors, imagery and key visuals.`);
    else if (asset) parts.push("I'll extract your brand colors, imagery and key visuals from the uploaded files.");
    if (refs.length) parts.push(`From the reference ${refs.length > 1 ? 'sites' : 'site'} I'll borrow the visual style, layout language and editorial feel.`);
    if (importedSite) {
      if (importedSite.mode === 'design') parts.push(`I'll apply ${importedSite.host}'s visual style to your new site.`);
      else if (importedSite.isShopify) parts.push(`I'll import your pages, content and products from your Shopify store at ${importedSite.host}.`);
      else parts.push(`I'll import your pages and content from ${importedSite.host}.`);
    }
    // Field completion hints for missing fields
    const key = (detectName(prompt) ? '1' : '0') + (detectType(prompt) ? '1' : '0') + (detectUnique(prompt) ? '1' : '0');
    if (key !== '111') {
      const hints = [];
      if (key[0] === '0') hints.push('my site name is...');
      if (key[1] === '0') hints.push("it's a ... business");
      if (key[2] === '0') hints.push('what makes it unique is...');
      if (hints.length) parts.push(hints.join(', '));
    }
    return parts.join(' ');
  };

  const handleContinue = () => {
    if (continuing) return;
    setContinuing(true);
    setTimeout(() => {
      setContinuing(false);
      const key = (detectName(prompt) ? '1' : '0') + (detectType(prompt) ? '1' : '0') + (detectUnique(prompt) ? '1' : '0');
      setReadyKey(key);
      const touch = buildAriaTouch();
      setAriaTouch(touch);
      setScreen('transitioning');
      setTimeout(() => setScreen('ready'), touch ? 3200 : 1800);
    }, 600);
  };

  const closeOverlay = () => setOv(null);
  const confirmAsset = (names, type = 'asset') => {
    setAsset(true);
    const arr = Array.isArray(names) ? names : ['logo.png'];
    recordTypes(arr, type);
    setAssetFiles(prev => { const newOnes = arr.filter(n => !prev.includes(n)); return [...prev, ...newOnes]; });
    setAssetCount(prev => prev + arr.length);
    if (screen === 'empty') setScreen('text');
    setOv(null);
  };
  const confirmRef = (url) => {
    const u = url || 'example.com';
    if (!refs.includes(u)) { setRefs(prev => [...prev, u]); if (screen === 'empty') setScreen('text'); }
    setOv(null);
  };
  const confirmVisualRef = ({ files = [], url = null }) => {
    if (files.length) { setAsset(true); recordTypes(files, 'ref'); setAssetFiles(prev => { const newOnes = files.filter(n => !prev.includes(n)); return [...prev, ...newOnes]; }); }
    if (url && !refs.includes(url)) setRefs(prev => [...prev, url]);
    if (files.length || url) { if (screen === 'empty') setScreen('text'); }
    setOv(null);
  };
  const addContent = confirmAsset;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(180deg, #ffffff 0%, #eaf0fb 55%, #d8e5f5 100%)', fontFamily: 'var(--wds-font-family-default, "Wix Madefor Text", "Madefor", sans-serif)' }}>
      <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(180deg, #ffffff 0%, #eaf0fb 55%, #d8e5f5 100%)', position: 'relative' }}>
        <style>{`
          @keyframes h-spin { to { transform: rotate(360deg); } }
          @keyframes h-orbA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(180px,200px); } }
          @keyframes h-orbB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-120px,-120px); } }
          @keyframes h-shimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
          .hf-tcard:hover .hf-scrim { opacity: 1 !important; pointer-events: auto !important; }
          .hf-tcard:hover { border-color: #2D4EE0 !important; }
          .h-shimmer { background: linear-gradient(90deg,#116DFF,#5B8FFF,#A78BFA,#60AFFF,#116DFF); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: h-shimmer 4s linear infinite; }
          @keyframes h-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes h-menu { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          textarea::placeholder, input::placeholder { color: #AAAAAA !important; opacity: 1; }
          @keyframes tw-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes aria-float { 0%,100% { transform: translateY(0px); } 40% { transform: translateY(-5px); } 70% { transform: translateY(-3px); } }
          .aria-avatar { animation: aria-float 3.8s ease-in-out infinite; }
        `}</style>

        {/* header */}
        <div style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2, background: 'transparent', maxWidth: 1400, margin: '0 auto' }}>
          <img src="logo.svg" alt="Wix" style={{ height: 22, width: 'auto', display: 'block' }} />
          <img src="image-1781023178778.webp" alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '2px solid #fff', display: 'block', flexShrink: 0 }} />
          <div style={{ flex: 1 }} />
          <button className="hbtn hbtn-std-secondary" style={{ ...hBtn('medium'), background: '#fff', color: '#2F5DFF', border: '1px solid #2F5DFF' }}>Upgrade</button>
        </div>

        {/* main */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64, paddingBottom: 64 }}>
          <div style={{ width: 1100, maxWidth: '96%' }}>
            {/* greeting */}
            <div style={{ position: 'relative', marginBottom: 32 }}>
              {screen === 'ready' &&
                <button onClick={() => setScreen('text')} className="hbtn hbtn-secondary" style={{ ...hBtnSecondary('small'), position: 'absolute', top: -36, left: 0, border: '1px solid rgba(0,0,0,0.14)', color: H_MUTED, background: 'transparent' }}>← Back</button>
              }
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <HAria size={55} style={{ flexShrink: 0, marginTop: 2 }} className="aria-avatar" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TypewriterTitle
                  key={hs_.l1}
                  text={hs_.l1}
                  style={{ fontFamily: '"Wix Madefor Display App","Wix Madefor Display",sans-serif', fontSize: 34, fontWeight: 400, lineHeight: '39.1px', letterSpacing: '-0.8px', background: 'linear-gradient(90deg, #315FFF 0%, #1D3999 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                />
                <TypewriterBody key={hs_.l2Parts.join('|')} parts={hs_.l2Parts} delay={500 + hs_.l1.length * 20 + 100} />
              </div>
              </div>
            </div>

            {/* input card */}
            <div
              className={isTyping && !ready && !transitioning ? 'hf-typing-card' : ''}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ background: dragOver ? '#F0F4FF' : ready ? '#F4F6FF' : 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', minHeight: 360, borderRadius: 16, border: dragOver ? '2px dashed #2F5DFF' : `1px solid ${ready ? '#B8C5FF' : 'rgba(255,255,255,0.7)'}`, boxShadow: ready ? '0 4px 32px rgba(80,100,220,0.14)' : '0 2px 12px rgba(100,100,180,0.07)', transition: 'background 0.3s ease, border-color 0.2s ease, box-shadow 0.6s ease', position: 'relative', zIndex: ov === 'dropdown' ? 30 : 1, display: 'flex', flexDirection: 'column', animation: 'card-enter 420ms ease-out' }}>
              {dragOver && <div style={{ position: 'absolute', inset: 0, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}><div style={{ background: 'rgba(47,93,255,0.06)', borderRadius: 16, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#2F5DFF' }}>Drop files or URLs here</div></div>}
              {/* attachment chips — grouped by type, colored edge per type */}
              {(asset || refs.length > 0 || importedSite) && (() => {
                const allFiles = assetFiles.length ? assetFiles : (asset ? ['logo.png'] : []);
                const removeFile = (nm) => {
                  const removedIndex = allFiles.indexOf(nm);
                  const next = allFiles.filter((_, idx) => idx !== removedIndex);
                  setAssetFiles(next); if (!next.length) setAsset(false);
                  showUndo(nm, () => { setAssetFiles(prev => { const arr = [...prev]; arr.splice(removedIndex, 0, nm); return arr; }); setAsset(true); });
                };
                const removeRef = (r) => {
                  const idx = refs.indexOf(r);
                  setRefs(prev => prev.filter((_, j) => j !== idx));
                  showUndo(r, () => setRefs(prev => { const arr = [...prev]; arr.splice(idx, 0, r); return arr; }));
                };
                const groups = [
                  { type: 'asset', label: 'Assets', items: allFiles.filter(n => (fileTypes[n] || 'asset') === 'asset') },
                  { type: 'ref', label: 'References', items: [...allFiles.filter(n => fileTypes[n] === 'ref'), ...refs] },
                  { type: 'file', label: 'Info', items: allFiles.filter(n => fileTypes[n] === 'file') },
                ].filter(g => g.items.length);
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 18, padding: '14px 28px 6px' }}>
                    {groups.map(g => (
                      <div key={g.type} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#9A9AB0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{g.label}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {g.items.map((nm, i) =>
                            <AttachmentChip key={i} name={nm} type={g.type} onRemove={() => refs.includes(nm) ? removeRef(nm) : removeFile(nm)} />
                          )}
                        </div>
                      </div>
                    ))}
                    {/* importedSite is now shown inline in the action bar — no separate chip here */}
                  </div>
                );
              })()}

              {/* Undo toast */}

              {/* text area / transition view */}
              {transitioning ?
                <div style={{ flex: 1, padding: '24px 28px 18px', fontSize: 24, lineHeight: 1.5, minHeight: 200 }}>
                  <span style={{ color: H_INK, fontWeight: 600 }}>{prompt}</span>
                  {ariaTouch ? <span> <TypewriterInline key={ariaTouch} text={ariaTouch} color="#5B7FFF" delay={600} /></span> : null}
                </div> :
                <div style={{ flex: 1, position: 'relative', minHeight: 200, maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* visual spacer for height */}
                  <div aria-hidden="true" style={{ padding: '24px 28px 0', fontSize: 24, lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word', visibility: 'hidden' }}>
                    {prompt || ' '}
                    {ready && ariaTouch ? <span> {ariaTouch}</span> : null}
                  </div>
                  {/* overlay: prompt (transparent) + ariaTouch in purple */}
                  <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 28px 0', fontSize: 24, lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <span style={{ color: 'transparent' }}>{prompt}</span>
                    {ready && ariaTouch ? <span style={{ color: '#7B6CF6' }}> {ariaTouch}</span> : null}
                  </div>
                  {/* editable textarea */}
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Auto-detect URL typed/pasted followed by space
                      const urlMatch = val.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|io|co|net|org|dev|app|shop|ly))\s$/);
                      if (urlMatch) {
                        const raw = urlMatch[1];
                        const host = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                        if (!refs.includes(host)) { setRefs(prev => [...prev, host]); if (screen === 'empty') setScreen('text'); }
                        setPrompt(val.slice(0, val.length - raw.length - 1).trimEnd());
                        return;
                      }
                      setPrompt(val);
                      if (screen === 'empty' && val) setScreen('text');
                      if (!val && !asset && !refs.length && !importedSite) { setScreen('empty'); setEmptyKey(k => k + 1); }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !ov) {
                        const canContinue = prompt.trim() || asset || refs.length || importedSite;
                        if (canContinue && !continuing) { e.preventDefault(); handleContinue(); }
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').trim();
                      if (/^(https?:\/\/|www\.)[^\s]+$/.test(pasted) || /^[a-zA-Z0-9-]+\.(?:com|io|co|net|org|dev|app|shop|ly)$/.test(pasted)) {
                        e.preventDefault();
                        const host = pasted.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                        if (!refs.includes(host)) { setRefs(prev => [...prev, host]); if (screen === 'empty') setScreen('text'); }
                      }
                    }}
                    onFocus={() => {
                      // Merge ariaTouch into editable prompt when user clicks in
                      if (ready && ariaTouch) {
                        const merged = prompt ? prompt + ' ' + ariaTouch : ariaTouch;
                        setPrompt(merged);
                        setAriaTouch('');
                        // Place cursor at end
                        setTimeout(() => { if (textareaRef.current) { textareaRef.current.setSelectionRange(merged.length, merged.length); } }, 0);
                      }
                    }}
                    placeholder=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', boxSizing: 'border-box', border: 0, outline: 'none', resize: 'none', background: 'transparent', padding: '24px 28px', fontSize: 24, lineHeight: 1.5, color: H_INK, fontFamily: 'inherit', overflowY: 'auto', zIndex: 1 }} />
                  {/* custom placeholder with crossfade */}
                  {!prompt && placeholderText && (
                    <div key={placeholderKey} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 28px 0', fontSize: 24, lineHeight: 1.5, color: '#AAAAAA', pointerEvents: 'none', animation: 'placeholder-fadein 320ms ease', zIndex: 0 }}>
                      {placeholderText}
                    </div>
                  )}
                </div>
              }


              {/* action row */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 17, paddingBottom: 5, paddingLeft: 14, paddingRight: 14, display: 'flex', alignItems: 'center' }}>
                {importedSite ? (
                  /* ── "Added" state: site imported → inline URL chip in action bar ── */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <button className="hbtn hbtn-ghost" onClick={() => setOv('import-url')} style={{ ...hBtnGhost('medium'), gap: 5, paddingLeft: 6, paddingRight: 10, color: '#32324D' }}>
                      <HIc name="link" size={14} color="#32324D" />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>Create from URL</span>
                    </button>
                    <span style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.12)', margin: '0 6px' }} />
                    <div style={{ position: 'relative' }}>
                      {ov === 'dropdown' &&
                        <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, width: 280, background: '#fff', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 6, zIndex: 30, animation: 'h-menu 160ms ease-out' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px' }}>Add to your prompt</div>
                          <DropRow icon="image" bg="#FFF0E8" fg="#C05B2A" title="Add assets" desc="Upload media to use in your site" onClick={() => setOv('assets')} />
                          <DropRow icon="link" icon2="image" bg="#EDE9FF" fg="#6040D0" title="Add visual references" desc="Give Aria a look & feel to start from" onClick={() => setOv('url')} />
                          <DropRow icon="document" bg="#E8F3FF" fg="#1A6CC0" title="Add info" desc="Any info that helps Aria build a better site" onClick={() => setOv('files')} />
                          <span style={{ position: 'absolute', left: 12, bottom: -7, width: 14, height: 14, background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.10)', borderBottom: '0.5px solid rgba(0,0,0,0.10)', transform: 'rotate(45deg)' }} />
                        </div>
                      }
                      <button className="hbtn hbtn-ghost" onClick={() => setOv(ov === 'dropdown' ? null : 'dropdown')} style={{ ...hBtnGhost('medium'), width: 32, padding: 0, minWidth: 0, color: '#32324D' }}>
                        <HIc name="plus" size={14} color="#32324D" />
                      </button>
                    </div>
                    <span style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.12)', margin: '0 6px' }} />
                    {/* URL chip */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 30, padding: '0 10px 0 10px', background: '#fff', border: '1px solid #E8E7E7', borderRadius: 24, fontSize: 12, color: '#151414', fontWeight: 400, fontFamily: 'inherit' }}>
                      <img src={`https://www.google.com/s2/favicons?domain=${importedSite.host}&sz=32`} width={13} height={13} style={{ borderRadius: 2, flexShrink: 0, display: 'block' }} onError={(e) => { e.target.style.display='none'; }} />
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{importedSite.host}</span>
                      {importedSite.isShopify && <span style={{ background: '#EDFAF3', borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#1A8A5A', flexShrink: 0 }}>Shopify</span>}
                      <button onClick={() => { const s = importedSite; setImportedSite(null); showUndo(s.host, () => setImportedSite(s)); }} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 0, marginLeft: 2, flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="#888" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── "Default" state: Add dropdown + Create from URL ── */
                  <>
                    <div style={{ position: 'relative' }}>
                      {ov === 'dropdown' &&
                        <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, width: 280, background: '#fff', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 6, zIndex: 30, animation: 'h-menu 160ms ease-out' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px' }}>Add to your prompt</div>
                          <DropRow icon="image" bg="#FFF0E8" fg="#C05B2A" title="Add assets" desc="Upload media to use in your site" onClick={() => setOv('assets')} />
                          <DropRow icon="link" icon2="image" bg="#EDE9FF" fg="#6040D0" title="Add visual references" desc="Give Aria a look & feel to start from" onClick={() => setOv('url')} />
                          <DropRow icon="document" bg="#E8F3FF" fg="#1A6CC0" title="Add info" desc="Any info that helps Aria build a better site" onClick={() => setOv('files')} />
                          <span style={{ position: 'absolute', left: 22, bottom: -7, width: 14, height: 14, background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.10)', borderBottom: '0.5px solid rgba(0,0,0,0.10)', transform: 'rotate(45deg)' }} />
                        </div>
                      }
                      <button className="hbtn hbtn-secondary" onClick={() => setOv(ov === 'dropdown' ? null : 'dropdown')} style={{ ...hBtnSecondary('medium'), border: `1px solid ${ov === 'dropdown' ? H_BLUE : '#E0E0E0'}`, background: ov === 'dropdown' ? 'rgba(45,78,224,0.06)' : '#fff', color: ov === 'dropdown' ? H_BLUE : '#32324D' }}>
                        <HIc name="plus" size={14} color={ov === 'dropdown' ? H_BLUE : '#32324D'} />
                        Add
                      </button>
                    </div>
                    <span style={{ width: 1, height: 18, background: 'rgba(0,0,0,0.10)', margin: '0 10px' }} />
                    <button className="hbtn hbtn-secondary" onClick={() => setOv('import-url')} style={{ ...hBtnSecondary('medium') }}>
                      <HIc name="globe" size={14} color="#32324D" />
                      Create from URL
                    </button>
                  </>
                )}
                <div style={{ flex: 1 }} />
                <span style={{ position: 'relative', display: 'inline-flex' }}
                    onMouseEnter={() => { const d = (!prompt.trim() && !asset && !refs.length && !importedSite) || continuing; if (d) setShowContinueTip(true); }}
                    onMouseLeave={() => setShowContinueTip(false)}>
                  {(() => { const isDisabled = (!prompt.trim() && !asset && !refs.length && !importedSite) || continuing; return (
                    <button className="hbtn" onClick={!isDisabled ? () => { if (window.DISABLE_GENERATE) return; setContinuing(true); setTimeout(() => { setContinuing(false); onGenerate && onGenerate(prompt); }, 600); } : undefined} disabled={isDisabled}
                      style={{ ...hBtnPrimary('medium'), opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', minWidth: 152, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: isDisabled ? 'none' : 'auto' }}>
                      {continuing ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'h-spin 0.8s linear infinite' }} />Loading…</> : 'Generate site'}
                    </button>
                  ); })()}
                  {showContinueTip && (!prompt.trim() && !asset && !refs.length && !importedSite) && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: '#000624', color: '#fff', borderRadius: 'var(--wds-tooltip-border-radius, 6px)', padding: '8px 12px', fontSize: 12, fontWeight: 400, whiteSpace: 'nowrap', boxShadow: '0 6px 6px 0 rgba(22,45,61,0.06), 0 0 18px 0 rgba(22,45,61,0.12)', pointerEvents: 'none', zIndex: 100 }}>
                      Start typing to give Aria a starting point
                      <span style={{ position: 'absolute', bottom: -5, right: 20, width: 10, height: 10, background: '#000624', transform: 'rotate(45deg)', borderRadius: 2 }} />
                    </div>
                  )}
                </span>
              </div>
            </div>

            {/* example chips */}
            {!ready && !transitioning && <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, color: H_MUTED, marginBottom: 10 }}>Try an example prompt</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  [
                    ['Fashion store', "A sustainable women's fashion boutique focused on minimalist, ethically sourced slow-fashion pieces. Every item is curated for style-conscious women who value quality over quantity."],
                    ['Online course', "An online course teaching productivity and time management to overwhelmed professionals. What makes it special is a signature 5-day sprint method — students see real results in one week."],
                    ['Wellness service', "A wellness coaching practice offering holistic sessions — nutrition, movement and mindset for busy women. What makes it unique is a personalized 1:1 approach with weekly accountability check-ins."],
                    ['Consulting website', "A boutique consultancy helping early-stage startups build their go-to-market strategy. We specialize in SaaS, fintech and consumer brands, with 10 years of hands-on experience."],
                    ['Community hub', "A membership hub for indie makers and creative entrepreneurs — weekly live sessions, a curated resource library and a tight-knit community focused on sustainable growth."],
                    ['Creative portfolio', "A design studio portfolio specializing in bold identity systems for hospitality and lifestyle brands. The work balances innovative typography with refined, editorial details and authentic storytelling."],
                  ],
                  [
                    ['Photography studio', "A wedding and portrait photography studio with a documentary, candid style. Known for capturing genuine emotion, working with natural light, and delivering timeless galleries."],
                    ['Coffee shop', "A specialty coffee shop and roastery in the heart of the city. We source single-origin beans directly from farmers, brew with precision, and host weekly tasting events."],
                    ['Law firm', "A boutique law firm specializing in startup legal services — incorporation, fundraising, IP protection and employment contracts. Flat-fee packages designed for founders."],
                    ['Fitness coach', "An online personal training platform for busy parents who want to get fit in 30 minutes a day. Programs are home-friendly, progressive, and backed by a supportive community."],
                    ['Interior design', "An interior design studio creating calm, functional spaces for modern families. We blend Scandinavian minimalism with warm textures and sustainable materials."],
                    ['Music school', "A local music school offering lessons in guitar, piano and vocals for all ages. Small class sizes, flexible scheduling, and a focus on playing music you actually love."],
                  ],
                  [
                    ['Event planner', "A boutique event planning studio specializing in intimate weddings and corporate retreats. We handle every detail — from venue scouting to day-of coordination — so clients can be present."],
                    ['Tech startup', "A B2B SaaS tool that helps operations teams automate their recurring workflows without writing code. Backed by Y Combinator, used by 500+ companies in 30 countries."],
                    ['Bakery', "A home-based bakery specializing in custom celebration cakes and allergen-friendly treats. All orders are made to order using organic, locally sourced ingredients."],
                    ['Real estate', "A real estate agency focused on helping first-time buyers navigate the Tel Aviv market. We offer bilingual service, transparent pricing, and end-to-end support."],
                    ['Kids education', "An after-school enrichment program teaching coding and robotics to kids aged 7–14. Project-based, self-paced, and designed to spark curiosity and problem-solving confidence."],
                    ['Therapist', "A licensed psychotherapist offering CBT and mindfulness-based sessions for adults dealing with anxiety, burnout, and life transitions. Online and in-person in Berlin."],
                  ],
                ][ideasSet % 3].map(([t, full], i) =>
                <button key={i} onClick={() => {setPrompt(full);setScreen('text');}} className="hf-chip" style={{ height: 40, padding: '0 18px', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 14, color: '#2C2C2C', cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease' }}>{t}</button>
                )}
                <button onClick={() => setIdeasSet(s => s + 1)} className="hf-chip hf-chip-more" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 40, padding: '0 18px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 14, color: H_BLUE, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 120ms ease, border-color 120ms ease' }}><HIc name="refresh" size={14} color={H_BLUE} /> More ideas</button>
              </div>
            </div>}

          </div>
        </div>

        {/* dropdown dismiss scrim */}
        {ov === 'dropdown' && <div onClick={() => setOv(null)} style={{ position: 'absolute', inset: 0, zIndex: 20 }} />}

        {/* modals */}
        {ov === 'assets' && <AssetsModal onClose={closeOverlay} onAdd={confirmAsset} />}
        {ov === 'files' && <AssetsModal onClose={closeOverlay} onAdd={(names) => confirmAsset(names, 'file')} title="Add info" sub="Any info that helps Aria build a better site" hints={['Briefs, docs, brand guides, product lists — anything with context', 'Aria will use them to shape a better prompt for your site']} />}
        {ov === 'extract' && <ExtractModal onClose={closeOverlay} onAdd={confirmAsset} />}
        {ov === 'url' && <UrlModal onClose={closeOverlay} onAdd={confirmVisualRef} onBack={() => setOv('dropdown')} />}
        {ov === 'import-url' && <ImportFlow onClose={closeOverlay} onImport={(site) => {setImportedSite(site);if (screen === 'empty') setScreen('text');setOv(null);}} />}

        {/* Undo toast — fixed at bottom of viewport */}
        {undoItem && (
          <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: undoItem.restore ? '#32324D' : '#B71C1C', color: '#fff', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.22)', whiteSpace: 'nowrap', animation: 'fadeInUp 200ms ease-out' }}>
            <span>{undoItem.restore ? <>Removed <b style={{ fontWeight: 700 }}>{undoItem.label.length > 28 ? undoItem.label.slice(0, 28) + '…' : undoItem.label}</b></> : undoItem.label}</span>
            {undoItem.restore && <button onClick={() => { undoItem.restore(); clearTimeout(undoTimerRef.current); setUndoItem(null); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 10px', cursor: 'pointer' }}>Undo</button>}
          </div>
        )}
      </div>
    </div>);

}

function PhotoFan() {
  const crops = ['8% 50%', '33% 50%', '62% 50%', '88% 50%'];
  const rots  = [-15, -5, 5, 15];
  const W = 40, H = 56;
  return (
    <span style={{ position: 'relative', width: 72, height: H + 8, flexShrink: 0, display: 'inline-block', marginTop: -12, marginBottom: -4 }}>
      {crops.map((pos, i) => (
        <span key={i} style={{ position: 'absolute', left: '50%', bottom: 0, marginLeft: -W/2, width: W, height: H, borderRadius: 5, overflow: 'hidden', transform: `rotate(${rots[i]}deg)`, transformOrigin: 'bottom center', boxShadow: '0 2px 6px rgba(0,0,0,0.18)', border: '1.5px solid rgba(255,255,255,0.9)' }}>
          <img src="wix-inspo.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block' }} />
        </span>
      ))}
    </span>
  );
}

function FanIcon({ bg, fg, icon, icon2, size = 1 }) {
  const w = Math.round(29 * size), h = Math.round(29 * size), r = Math.round(7 * size);
  const gap = Math.round(17 * size);
  return (
    <span style={{ position: 'relative', width: Math.round(44 * size) + gap - 17, height: Math.round(34 * size), flexShrink: 0, display: 'inline-block' }}>
      <span style={{ position: 'absolute', left: 0, top: Math.round(4 * size), width: w, height: h, borderRadius: r, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.10)', transform: 'rotate(-10deg)', transformOrigin: 'bottom center' }}>
        <HIc name={icon} size={Math.round(13 * size)} color={fg} />
      </span>
      <span style={{ position: 'absolute', left: gap, top: Math.round(4 * size), width: w, height: h, borderRadius: r, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 5px rgba(0,0,0,0.13)', transform: 'rotate(10deg)', transformOrigin: 'bottom center' }}>
        <HIc name={icon2} size={Math.round(13 * size)} color={fg} />
      </span>
    </span>
  );
}

function DropRow({ icon, icon2, bg, fg, title, desc, onClick, hover }) {
  const [h, setH] = hs(false);
  const on = hover || h;
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 10, border: 0, background: on ? '#F4F7FF' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
      {icon2 ? (
        <FanIcon bg={bg} fg={fg} icon={icon} icon2={icon2} size={1.1} />
      ) : (
        <span style={{ width: 34, height: 34, borderRadius: 8, background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <HIc name={icon} size={16} color={fg} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: H_INK }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: H_MUTED, marginTop: 2 }}>{desc}</span>
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 14, color: '#CCCCDD' }}>&rsaquo;</span>
    </button>);

}
function SubRow({ icon, bg, fg, title, desc, onClick }) {
  const [h, setH] = hs(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: 0, background: h ? '#F4F7FF' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 28, height: 28, borderRadius: 6, background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HIc name={icon} size={13} color={fg} /></span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: H_INK }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: H_MUTED }}>{desc}</span>
      </span>
    </button>);

}

/* ---- modal scaffolding ---- */
function Overlay({ children }) {
  return <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, animation: 'h-fade 150ms ease-out' }}>{children}</div>;
}
const shell = { width: 480, maxWidth: '92%', background: '#fff', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,80,0.14)', overflow: 'hidden' };
const closeB = { width: 28, height: 28, borderRadius: '50%', background: '#F4F4F8', border: 0, fontSize: 14, color: H_MUTED, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const cancelB = hBtnSecondary('medium');
const addB    = hBtnPrimary('medium');

function ModalHead({ icon, iconBg, iconFg, iconEl, title, sub, badge, onClose, onBack, spin }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '22px 22px 16px', borderBottom: '1px solid #EEEEEE' }}>
      {onBack && <button onClick={onBack} onMouseEnter={(e) => e.currentTarget.style.color = '#1E1E2E'} onMouseLeave={(e) => e.currentTarget.style.color = '#888898'} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#888898', paddingRight: 10, display: 'inline-flex', alignItems: 'center', marginTop: 10 }}><HIc name="chevronLeft" size={16} color="currentColor" /></button>}
      {iconEl ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{iconEl}</span> : (icon || spin) ? (
      <span style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, color: iconFg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {spin ? <span style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid #DfE3F5`, borderTopColor: H_BLUE, display: 'inline-block', animation: 'h-spin 1.2s linear infinite' }} /> : <HIc name={icon} size={18} color={iconFg} />}
      </span>) : null}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: H_INK }}>{title}</span>
          {badge && <span style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--wds-badge-size-tiny, 20px)', padding: '0 var(--wds-badge-padding-horizontal-tiny, 6px)', borderRadius: 'var(--wds-badge-border-radius-tiny, 4px)', background: '#EDE9FF', fontSize: 12, fontWeight: 600, lineHeight: 1, color: '#7B5CF0', flexShrink: 0 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: H_MUTED, marginTop: 2 }}>{sub}</div>
      </div>
      {onClose && <button onClick={onClose} style={closeB}>&times;</button>}
    </div>);

}

const UploadZone = () =>
<div style={{ border: '1.5px dashed #D8D8EE', borderRadius: 12, padding: '24px 16px', background: '#FAFBFF', textAlign: 'center' }}>
    <HIc name="upload" size={24} color="#AAAACC" />
    <div style={{ fontSize: 13, fontWeight: 600, color: H_INK, marginTop: 10 }}>Drag &amp; drop or click to upload</div>
    <div style={{ fontSize: 11, color: H_MUTED, marginTop: 3 }}>Images, video, PDF, DOCX — up to 100 MB</div>
  </div>;


function AssetsModal({ onClose, onAdd, title = 'Add assets', sub = 'Upload media to use in your site', hints = ['Anything you’d put on your site — images, logos, videos', 'Aria will extract the content and visuals for you'] }) {
  const [files, setFiles] = hs([]);
  const [sizeErr, setSizeErr] = hs('');
  const inputRef = React.useRef(null);
  const MAX_MB = 25;
  const SAMPLE = ['logo.png', 'hero-photo.jpg', 'brand-deck.pdf', 'product-shot.jpg', 'about.docx', 'promo-clip.mp4'];
  const addFiles = (picked) => {
    // picked = array of names; if none (sample mode) add next sample
    const names = picked && picked.length ? picked : [SAMPLE[files.length % SAMPLE.length]];
    setFiles((f) => [...f, ...names.map((n) => ({ name: n }))]);
  };
  const addRealFiles = (fileList) => {
    const tooBig = fileList.filter(f => f.size > MAX_MB * 1024 * 1024);
    const ok = fileList.filter(f => f.size <= MAX_MB * 1024 * 1024);
    if (tooBig.length) {
      setSizeErr(`${tooBig.map(f => f.name).join(', ')} — exceeds ${MAX_MB} MB limit`);
      setTimeout(() => setSizeErr(''), 4000);
    }
    if (ok.length) setFiles(f => [...f, ...ok.map(f => ({ name: f.name }))]);
  };
  const removeAt = (i) => setFiles((f) => f.filter((_, idx) => idx !== i));
  const iconFor = (n) => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(n) ? 'image' : /\.(mp4|mov|webm)$/i.test(n) ? 'play' : 'document';
  return <Overlay><div onClick={(e) => e.stopPropagation()} style={shell}>
    <div style={{ padding: '22px 22px 16px', borderBottom: '1px solid #EEEEEE', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: H_INK }}>{title}</div>
        <div style={{ fontSize: 12, color: H_MUTED, marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={onClose} style={closeB}>&times;</button>
    </div>
    <div style={{ padding: '18px 20px' }}>
      {sizeErr && <div style={{ marginBottom: 10, background: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0392B', display: 'flex', alignItems: 'center', gap: 8 }}><HIc name="statusWarning" size={14} color="#C0392B" />{sizeErr}</div>}
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => { addRealFiles([...e.target.files]); e.target.value = ''; }} />
      <div onClick={() => inputRef.current && inputRef.current.click()} style={{ border: '1.5px dashed #D8D8EE', borderRadius: 12, padding: '24px 16px', background: '#FAFBFF', textAlign: 'center', cursor: 'pointer' }}>
        <HIc name="upload" size={24} color="#AAAACC" />
        <div style={{ fontSize: 13, fontWeight: 600, color: H_INK, marginTop: 10 }}>Drop files here or <span style={{ color: H_BLUE }}>browse your computer</span></div>
        <div style={{ fontSize: 11, color: H_MUTED, marginTop: 3 }}>Add as many as you like — images, video, PDF, DOCX</div>
      </div>

      {files.length > 0 &&
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid #EEEEF6', borderRadius: 10, background: '#fff' }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: '#FFF0E8', color: '#C05B2A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HIc name={iconFor(f.name)} size={14} color="#C05B2A" /></span>
              <span style={{ flex: 1, fontSize: 13, color: H_INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button onClick={() => removeAt(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#AAAAAA', fontSize: 15, lineHeight: 1 }}>×</button>
            </div>
          )}
          <button onClick={() => inputRef.current && inputRef.current.click()} className="hbtn hbtn-secondary" style={{ ...hBtnSecondary('small'), alignSelf: 'flex-start', color: H_BLUE, border: '1px solid #E0E0EC' }}><HIc name="plus" size={13} color={H_BLUE} /> Add more</button>
        </div>
        }

      <div style={{ marginTop: 12, background: '#F0F2FF', borderRadius: 8, padding: '10px 12px' }}>
        {hints.map((h, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < hints.length - 1 ? 5 : 0 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><HIc name="askAi" size={14} color={H_BLUE} /></span>
          <span style={{ fontSize: 12, color: H_BLUE, lineHeight: 1.5 }}>{h}</span>
        </div>
        )}
      </div>
    </div>
    <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #F0F0F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: H_MUTED }}>{files.length ? `${files.length} item${files.length > 1 ? 's' : ''} ready` : ''}</span>
      <span style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button>
        <button onClick={() => onAdd(files.length ? files.map((f) => f.name) : ['logo.png'])} className="hbtn" style={{ ...addB, opacity: files.length ? 1 : 0.4, cursor: files.length ? 'pointer' : 'not-allowed' }}>Add to Aria</button>
      </span>
    </div>
  </div></Overlay>;
}

function ExtractModal({ onClose, onAdd }) {
  const [opts, setOpts] = hs({ text: true, images: false, structure: false });
  const Row = ({ k, label }) =>
  <button onClick={() => setOpts((o) => ({ ...o, [k]: !o[k] }))} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${opts[k] ? H_BLUE : '#DEDEDE'}`, background: opts[k] ? H_BLUE : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{opts[k] && <HIc name="check" size={11} color="#fff" />}</span>
      <span style={{ fontSize: 13, color: H_INK }}>{label}</span>
    </button>;

  return <Overlay><div onClick={(e) => e.stopPropagation()} style={shell}>
    <ModalHead icon="document" iconBg="#EDFAF3" iconFg="#1A8A5A" title="Extract content from file" sub="Mark what Aria should pull out" onClose={onClose} />
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <UploadZone />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: H_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What should Aria extract?</div>
        <Row k="text" label="Text & copy" /><Row k="images" label="Images & visuals" /><Row k="structure" label="Structure & data" />
      </div>
    </div>
    <div style={{ padding: '12px 22px 18px', borderTop: '1px solid #EEEEEE', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button><button onClick={onAdd} className="hbtn" style={addB}>Extract</button>
    </div>
  </div></Overlay>;
}

/* ---- Add visual references — drag files first, URL as secondary option ---- */
function UrlModal({ onClose, onAdd, onBack }) {
  const [files, setFiles] = hs([]);
  const [url, setUrl] = hs('');
  const [urlErr, setUrlErr] = hs(false);
  const [dragOver, setDragOver] = hs(false);
  const inputRef = hr(null);
  const isValidUrl = (u) => /^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(u.trim());
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const canAdd = files.length > 0 || url.trim().length > 0;
  const addRealFiles = (fileList) => setFiles(f => [...f, ...fileList.map(x => ({ name: x.name })).filter(x => !f.some(y => y.name === x.name))]);
  const submit = () => {
    if (url.trim() && !isValidUrl(url)) { setUrlErr(true); return; }
    onAdd({ files: files.map(f => f.name), url: url.trim() ? host : null });
  };
  const iconFor = (n) => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(n) ? 'image' : /\.(mp4|mov|webm)$/i.test(n) ? 'play' : 'document';
  const wideShell = { ...shell, width: 520, maxWidth: '95vw', borderRadius: 16 };

  return <Overlay><div onClick={(e) => e.stopPropagation()} style={wideShell}>
    {/* header */}
    <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F4' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: H_INK }}>Add visual references</div>
        <div style={{ fontSize: 13, color: H_MUTED, marginTop: 3 }}>Give Aria a look &amp; feel to start from — screenshots, moodboards, designs or links.</div>
      </div>
      <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 6, marginTop: -2, borderRadius: 6, color: '#888898', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="#888898" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
    </div>

    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* primary: drag & drop / browse */}
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => { addRealFiles([...e.target.files]); e.target.value = ''; }} />
      <div
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addRealFiles([...e.dataTransfer.files]); }}
        style={{ border: `1.5px dashed ${dragOver ? '#2F5DFF' : '#D8D8EE'}`, borderRadius: 12, padding: '26px 16px', background: dragOver ? '#F0F4FF' : '#FAFBFF', textAlign: 'center', cursor: 'pointer', transition: 'background 120ms, border-color 120ms' }}>
        <HIc name="upload" size={24} color="#AAAACC" />
        <div style={{ fontSize: 13, fontWeight: 600, color: H_INK, marginTop: 10 }}>Drop visual references here or <span style={{ color: H_BLUE }}>browse your computer</span></div>
        <div style={{ fontSize: 11, color: H_MUTED, marginTop: 3 }}>Screenshots, moodboards, brand decks — anything that shows the style you want</div>
      </div>

      {files.length > 0 &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid #EEEEF6', borderRadius: 10, background: '#fff' }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: '#EDE9FF', color: '#6040D0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><HIc name={iconFor(f.name)} size={14} color="#6040D0" /></span>
              <span style={{ flex: 1, fontSize: 13, color: H_INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button onClick={() => setFiles(fl => fl.filter((_, idx) => idx !== i))} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#AAAAAA', fontSize: 15, lineHeight: 1 }}>×</button>
            </div>
          )}
        </div>
      }

      {/* secondary: URL option — lower hierarchy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ flex: 1, height: 1, background: '#F0F0F8' }} />
        <span style={{ fontSize: 11, color: '#AAAAAA' }}>or paste a link to a site you love</span>
        <span style={{ flex: 1, height: 1, background: '#F0F0F8' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input
          className="h-input"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setUrlErr(false); }}
          onKeyDown={(e) => e.key === 'Enter' && canAdd && submit()}
          placeholder="Paste any address or URL"
          style={{ height: 36, boxSizing: 'border-box', padding: '0 12px', border: `1px solid ${urlErr ? '#D32F2F' : '#DEDEE8'}`, borderRadius: 8, fontSize: 13, color: '#32324D', outline: 'none', fontFamily: 'inherit', background: '#fff', width: '100%', transition: 'border-color 120ms, box-shadow 120ms' }}
        />
        {urlErr && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#D32F2F" strokeWidth="1.4"/><path d="M8 4.5V8.5" stroke="#D32F2F" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="11" r="1" fill="#D32F2F"/></svg>
            <span style={{ fontSize: 12, color: '#B71C1C' }}>That doesn't look like a valid URL. Check it and try again.</span>
          </div>
        )}
      </div>
    </div>

    {/* footer */}
    <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #F0F0F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: H_MUTED }}>{files.length ? `${files.length} reference${files.length > 1 ? 's' : ''} ready` : ''}</span>
      <span style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button>
        <button onClick={submit} disabled={!canAdd} className="hbtn" style={{ ...addB, opacity: canAdd ? 1 : 0.4, cursor: canAdd ? 'pointer' : 'not-allowed' }}>Add to Aria</button>
      </span>
    </div>
  </div></Overlay>;
}


function ImportFlow({ onClose, onImport, initialUrl = '', initialPhase = 'url' }) {
  const [phase, setPhase] = hs(initialPhase);
  const [url, setUrl] = hs(initialUrl);
  const [sel, setSel] = hs('both');
  const isValidUrl = (u) => /^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(u.trim());
  const scan = () => {
    if (!isValidUrl(url)) { setPhase('error'); return; }
    setPhase('scanning');
    setTimeout(() => setPhase('results'), 1600);
  };
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'mysite.com';

  /* ── Demo detection rules ── */
  const isShopify = /shop/i.test(host) && !/woo/i.test(host);
  const isWoo = /woo/i.test(host);
  const platform = isShopify ? 'Shopify' : isWoo ? 'WooCommerce' : null;

  /* icon SVGs inline */
  const IconLayers = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L2 6.5L10 11L18 6.5L10 2Z" stroke={active ? '#32324D' : '#888'} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 10L10 14.5L18 10" stroke={active ? '#32324D' : '#888'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 13.5L10 18L18 13.5" stroke={active ? '#32324D' : '#888'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const IconPalette = ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C10.92 18 11.5 17.24 11.5 16.5C11.5 16.16 11.38 15.86 11.18 15.62C10.99 15.39 10.88 15.1 10.88 14.75C10.88 14.01 11.49 13.38 12.25 13.38H14C16.21 13.38 18 11.59 18 9.38C18 5.3 14.41 2 10 2Z" stroke={active ? '#32324D' : '#888'} strokeWidth="1.4"/>
      <circle cx="6.5" cy="9.5" r="1" fill={active ? '#32324D' : '#888'}/>
      <circle cx="9" cy="6.5" r="1" fill={active ? '#32324D' : '#888'}/>
      <circle cx="13" cy="7" r="1" fill={active ? '#32324D' : '#888'}/>
    </svg>
  );

  const Opt = ({ id, title, sub, icon, shopifyNote }) => {
    const on = sel === id;
    return (
      <button onClick={() => setSel(id)} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, boxSizing: 'border-box', textAlign: 'left', border: `1.5px solid ${on ? '#116DFF' : '#C1C2C3'}`, borderRadius: 10, padding: '12px 14px', background: on ? '#EEF4FF' : '#fff', cursor: 'pointer', transition: 'border-color 120ms, background 120ms', fontFamily: 'inherit' }}>
        {on && (
          <span style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: '50%', background: '#116DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: on ? '#32324D' : '#888' }}>{title}</span>
        </span>
        <span style={{ display: 'block', fontSize: 11, color: H_MUTED, marginTop: 5, lineHeight: 1.4 }}>{sub}</span>
        {shopifyNote && isShopify && (
          <span style={{ display: 'block', marginTop: 7, paddingTop: 7, borderTop: '1px solid rgba(17,109,255,0.15)', fontSize: 11, color: '#2F5DFF', fontWeight: 500 }}>✦ Includes products, images &amp; prices</span>
        )}
      </button>
    );
  };

  /* shell override — wider for this modal */
  const wideShell = { ...shell, width: 580, maxWidth: '95vw', borderRadius: 16 };

  /* ── Step 1: URL entry (also covers scanning / error states) ── */
  if (phase !== 'results') return <Overlay><div onClick={(e) => e.stopPropagation()} style={wideShell}>
    {/* header */}
    <div style={{ padding: '26px 28px 4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: H_INK, lineHeight: 1.3 }}>Create from URL</div>
        <div style={{ fontSize: 14, color: '#555566', marginTop: 5 }}>Use any website as starting point for your new site</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2 }}>
        <button style={{ border: 0, background: 'transparent', fontSize: 17, fontWeight: 600, color: H_INK, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>?</button>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 0, background: '#F1F1F4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="#1E1E2E" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
    {/* body */}
    <div style={{ padding: '18px 28px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input autoFocus value={url} disabled={phase === 'scanning'} onChange={(e) => { setUrl(e.target.value); if (phase === 'error') setPhase('url'); }} onKeyDown={(e) => e.key === 'Enter' && phase !== 'scanning' && scan()} placeholder="Paste any URL addresses" style={{ flex: 1, height: 38, boxSizing: 'border-box', padding: '0 12px', background: '#F6F6F8', border: `1px solid ${phase === 'error' ? '#D32F2F' : '#ECECF0'}`, borderRadius: 8, fontSize: 14, color: '#32324D', outline: 'none', fontFamily: 'inherit' }} />
        <button className="hbtn" onClick={scan} disabled={phase === 'scanning'} style={{ ...hBtnPrimary('medium'), flexShrink: 0, opacity: phase === 'scanning' ? 0.6 : 1, cursor: phase === 'scanning' ? 'default' : 'pointer' }}>{phase === 'scanning' ? 'Scanning…' : 'Scan'}</button>
      </div>
      {/* error */}
      {phase === 'error' &&
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#D32F2F" strokeWidth="1.4"/><path d="M8 4.5V8.5" stroke="#D32F2F" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="11" r="1" fill="#D32F2F"/></svg>
          <span style={{ fontSize: 13, color: '#B71C1C' }}>Couldn't reach this site. Check the URL and try again.</span>
        </div>
      }
      {/* scanning */}
      {phase === 'scanning' &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: '100%', height: 4, background: '#EEEEF6', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: '60%', height: '100%', background: '#2F5DFF', borderRadius: 4, transition: 'width 0.4s' }} /></div>
          <div style={{ fontSize: 13, color: H_MUTED }}>Analyzing {host}…</div>
        </div>
      }
    </div>
    {/* WDS footnote strip */}
    <div style={{ background: '#F0F0F4', borderTop: '1px solid #E8E8E8', borderRadius: '0 0 16px 16px', padding: '12px 28px' }}>
      <span style={{ fontSize: 12, color: '#888898' }}>Only use URLs where you have rights to the content.</span>
    </div>
  </div></Overlay>;

  /* ── Step 2: scan results ── */
  return <Overlay><div onClick={(e) => e.stopPropagation()} style={wideShell}>
    {/* header */}
    <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: H_INK, lineHeight: 1.3 }}>Create from URL</div>
        <div style={{ fontSize: 14, color: H_MUTED, marginTop: 4 }}>Use any website as a starting point for your new site.</div>
      </div>
      <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 6, marginTop: -2, borderRadius: 6, color: '#888898', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="#888898" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
    </div>

    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* site preview card */}
      <div style={{ border: '1px solid #E0E0EE', borderRadius: 10, overflow: 'hidden' }}>
        {/* browser bar */}
        <div style={{ height: 22, background: '#F3F4F6', display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', borderBottom: '1px solid #EBEBEB' }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c) => <span key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
          <span style={{ flex: 1, height: 12, background: '#E4E5EA', borderRadius: 4, marginLeft: 8 }} />
        </div>
        {/* screenshot */}
        <div style={{ height: 148, background: '#E8EAF0', overflow: 'hidden' }}>
          <img src={`https://image.thum.io/get/width/640/crop/400/${url.startsWith('http') ? url : 'https://' + url}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        </div>
        {/* footer row */}
        <div style={{ padding: '9px 14px', background: '#fff', borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#32324D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host}</span>
          {platform === 'Shopify' && <span style={{ background: '#EDFAF3', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1A8A5A', flexShrink: 0 }}>Shopify</span>}
          {platform === 'WooCommerce' && <span style={{ background: '#F3EEFF', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#7B3FC4', flexShrink: 0 }}>WooCommerce</span>}
        </div>
      </div>

      {/* what Aria will keep */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#F6F7FF', borderRadius: 10, border: '1px solid #E0E5FF' }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M10 2L2 6.5L10 11L18 6.5L10 2Z" stroke="#2F5DFF" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2 10L10 14.5L18 10" stroke="#2F5DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 13.5L10 18L18 13.5" stroke="#2F5DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 13, color: '#32324D', lineHeight: 1.55 }}>
          {platform
            ? 'Aria will keep the pages, content and visual of your site — included products data, images and prices.'
            : 'Aria will keep the pages, content and visual of your site.'}
        </span>
      </div>
    </div>

    {/* footer */}
    <div style={{ padding: '12px 24px', borderTop: '1px solid #F0F0F4', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button>
      <button onClick={() => onImport({ host, isShopify: !!platform, platform, mode: 'both' })} className="hbtn" style={addB}>Add to Aria</button>
    </div>
    {/* WDS footnote strip */}
    <div style={{ background: '#F0F0F4', borderTop: '1px solid #E8E8E8', borderRadius: '0 0 16px 16px', padding: '12px 24px' }}>
      <span style={{ fontSize: 12, color: '#888898' }}>Only use URLs where you have rights to the content.</span>
    </div>
  </div></Overlay>;
}

/* ============================================================
   Generating / Site Brief screen
   ============================================================ */

function GeneratingScreen({ prompt }) {
  const [showImage, setShowImage] = hs(false);
  const [vis, setVis] = hs(0); // sections revealed 0-8

  he(() => {
    const timings = [300, 700, 1300, 2100, 3100, 4300, 5700, 7200];
    const timers = timings.map((ms, i) => setTimeout(() => setVis(i + 1), ms));
    const finalTimer = setTimeout(() => setShowImage(true), 10000);
    return () => { timers.forEach(clearTimeout); clearTimeout(finalTimer); };
  }, []);

  const shimmerStyle = {
    background: 'linear-gradient(90deg, #e8edf5 25%, #d0d9ea 50%, #e8edf5 75%)',
    backgroundSize: '400% 100%',
    animation: 'skel-shimmer 1.8s ease-in-out infinite',
    borderRadius: 8,
  };

  const fadeIn = (i) => ({
    opacity: visibleSections > i ? 1 : 0,
    transform: visibleSections > i ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  });

  const sh = {
    background: 'linear-gradient(90deg, #e8edf5 25%, #d4dcea 50%, #e8edf5 75%)',
    backgroundSize: '400% 100%',
    animation: 'skel-shimmer 1.8s ease-in-out infinite',
    borderRadius: 6,
  };
  const fi = (i) => ({
    opacity: vis > i ? 1 : 0,
    transform: vis > i ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  });

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#f0f2f8' }}>
      <style>{`@keyframes skel-shimmer { 0% { background-position: 100% center; } 100% { background-position: -100% center; } }`}</style>

      {/* ── Skeleton matching 5.png layout ── */}
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', opacity: showImage ? 0 : 1, transition: 'opacity 0.9s ease' }}>

        {/* TOP BAR — matches 5.png exactly (~44px) */}
        <div style={{ height: 44, background: '#fff', borderBottom: '1px solid #e2e6ef', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0 }}>
          <div style={{ ...sh, width: 26, height: 14, borderRadius: 3 }} />
          <div style={{ ...sh, width: 12, height: 12, borderRadius: '50%' }} />
          <div style={{ ...sh, width: 72, height: 12, marginLeft: 4 }} />
          <div style={{ ...sh, width: 58, height: 12 }} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ ...sh, width: 110, height: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ ...sh, width: 52, height: 20, borderRadius: 10, background: 'linear-gradient(90deg,#c8f5b0,#b8eeaa)', animation: 'none' }} />
            <div style={{ ...sh, width: 58, height: 20, borderRadius: 10 }} />
            {[20,20,20,18].map((w,i) => <div key={i} style={{ ...sh, width: w, height: 18, borderRadius: 4 }} />)}
            <div style={{ ...sh, width: 58, height: 26, borderRadius: 13 }} />
            <div style={{ ...sh, width: 58, height: 26, borderRadius: 13, background: 'linear-gradient(90deg,#2D4EE0,#4466EE)', animation: 'none' }} />
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT — main canvas (~78.5% width, matching 5.png) */}
          <div style={{ flex: '0 0 78.5%', background: '#f0f2f8', position: 'relative' }}>
            {/* white card with left indent (matches the Site Brief card) */}
            <div style={{ marginLeft: '8%', height: '100%', background: '#fff', borderLeft: '1px solid #e8edf5', boxShadow: '-2px 0 12px rgba(0,0,0,0.04)', padding: '24px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Site Brief label + big title */}
              <div style={fi(0)}>
                <div style={{ ...sh, width: 68, height: 11, marginBottom: 10 }} />
                <div style={{ ...sh, width: '42%', height: 38, borderRadius: 8 }} />
              </div>

              {/* Prompt block + domain card side by side */}
              <div style={{ ...fi(1), display: 'flex', gap: 20 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ ...sh, width: 72, height: 10 }} />
                  {[100,96,98,92,88,60].map((w,i) => <div key={i} style={{ ...sh, width: `${w}%`, height: 9 }} />)}
                </div>
                <div style={{ width: '33%', flexShrink: 0, background: '#f8f9fc', borderRadius: 12, border: '1px solid #e8edf5', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ ...sh, width: 76, height: 10 }} />
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <div style={{ ...sh, width: 13, height: 13, borderRadius: '50%' }} />
                    <div style={{ ...sh, width: '65%', height: 11 }} />
                  </div>
                  <div style={{ ...sh, width: '78%', height: 30, borderRadius: 15 }} />
                  <div style={{ ...sh, width: '90%', height: 9 }} />
                </div>
              </div>

              {/* Card grid row 1 — typography / colors / photo */}
              <div style={{ ...fi(2), display: 'flex', gap: 12, flex: '0 0 auto' }}>
                {/* Typography — dark card */}
                <div style={{ flex: 1, height: 130, borderRadius: 12, background: '#1a1f2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 }}>
                  <div style={{ ...sh, width: 56, height: 9, opacity: 0.22, borderRadius: 4 }} />
                  <div style={{ ...sh, width: '65%', height: 44, borderRadius: 6, opacity: 0.18 }} />
                  <div style={{ ...sh, width: '80%', height: 9, opacity: 0.18 }} />
                </div>
                {/* Colors — stacked bars */}
                <div style={{ flex: 1, height: 130, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {['#dce4f0','#c8d4e8','#b8c8e0','#c4d0e8','#d0daee'].map((c,i) => (
                    <div key={i} style={{ flex: 1, background: c }} />
                  ))}
                </div>
                {/* Photo placeholder */}
                <div style={{ flex: 1, height: 130, borderRadius: 12, ...sh }} />
              </div>

              {/* Card grid row 2 — visual profile / site goals / site apps */}
              <div style={{ ...fi(3), display: 'flex', gap: 12, flex: '0 0 auto' }}>
                <div style={{ flex: 1, height: 100, borderRadius: 12, background: '#f8f9fc', border: '1px solid #e8edf5', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ ...sh, width: 76, height: 9 }} />
                  <div style={{ ...sh, width: '65%', height: 32, borderRadius: 6 }} />
                  <div style={{ ...sh, width: '48%', height: 9 }} />
                </div>
                <div style={{ flex: 1, height: 100, borderRadius: 12, background: '#f0ece6', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ ...sh, width: 58, height: 9, opacity: 0.45 }} />
                  {[0,1,2].map(i => (
                    <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(0,0,0,0.14)', flexShrink: 0 }} />
                      <div style={{ ...sh, flex: 1, height: 9, opacity: 0.4 }} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, height: 100, borderRadius: 12, background: '#f8f9fc', border: '1px solid #e8edf5', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ ...sh, width: 58, height: 9 }} />
                  <div style={{ ...sh, width: '100%', height: 9 }} />
                  <div style={{ ...sh, width: '80%', height: 9 }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Aria panel (~21.5% width, matching 5.png) */}
          <div style={{ flex: '0 0 21.5%', background: '#fff', borderLeft: '1px solid #e2e6ef', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Aria header */}
            <div style={{ ...fi(4), padding: '16px 18px 12px', borderBottom: '1px solid #f0f2f7' }}>
              <div style={{ ...sh, width: 38, height: 13, marginBottom: 16 }} />
              {/* Chat message bubble */}
              <div style={{ ...sh, width: '95%', height: 48, borderRadius: 10, marginBottom: 8 }} />
            </div>

            {/* Chat body */}
            <div style={{ ...fi(5), flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ ...sh, width: '70%', height: 11 }} />
              <div style={{ ...sh, width: '55%', height: 11 }} />
              {/* Progress items */}
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['#c8e8c8','80%'],['#c8e8c8','72%'],['#c8d8f0','60%'],['#e0e4ee','50%']].map(([c,w],i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: c, flexShrink: 0 }} />
                    <div style={{ ...sh, width: w, height: 10 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Apps widget — bottom, matches 5.png position */}
            <div style={{ ...fi(6), borderTop: '1px solid #e8edf5', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...sh, width: 110, height: 12 }} />
                <div style={{ ...sh, width: 16, height: 16, borderRadius: '50%' }} />
              </div>
              <div style={{ ...sh, width: '80%', height: 9 }} />
              {/* App rows */}
              {[0,1].map(i => (
                <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'center', background: '#f8f9fc', borderRadius: 8, padding: '8px 10px', border: '1px solid #e8edf5' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 3, background: '#e0e4ee', flexShrink: 0 }} />
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: i === 0 ? '#dde8ff' : '#1a2a4e', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ ...sh, width: '60%', height: 10 }} />
                    <div style={{ ...sh, width: '85%', height: 8 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <div style={{ ...sh, width: 60, height: 10 }} />
                <div style={{ ...sh, width: 50, height: 28, borderRadius: 14, background: 'linear-gradient(90deg,#2D4EE0,#4466EE)', animation: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot fades in after skeleton */}
      <img
        src="wds/5.png"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top left', display: 'block',
          opacity: showImage ? 1 : 0,
          transition: 'opacity 0.9s ease',
          pointerEvents: showImage ? 'auto' : 'none',
        }}
      />
    </div>
  );
}

/* ============================================================
   Figma Entry Screen — "Design your site with Aria"
   Static browser-chrome wrapper + functional Create from URL
   ============================================================ */

const FG_ASSETS = {
  btns:       'https://www.figma.com/api/mcp/asset/a277e0c8-e194-4e67-b1c2-cb73a2d2f7fa',
  wixFav:     'https://www.figma.com/api/mcp/asset/952efd76-725d-4839-bd8d-7a6ae5bd8606',
  wixFav2:    'https://www.figma.com/api/mcp/asset/fbcb9b2c-d274-4a1d-8c23-162f68097210',
  cruzar1:    'https://www.figma.com/api/mcp/asset/1f4a397a-db46-4041-a626-36f7439694c5',
  cruzar2:    'https://www.figma.com/api/mcp/asset/1850a733-dd8d-45b5-a78f-a15e9c9ba66f',
  vec1:       'https://www.figma.com/api/mcp/asset/1541f18d-3d88-41a4-8abd-871b35c1027e',
  vec2:       'https://www.figma.com/api/mcp/asset/fddfcc40-78bc-4a60-b248-0159b187f75c',
  vec3:       'https://www.figma.com/api/mcp/asset/ea36f11d-0b9d-4f8d-867c-e3274674f5d2',
  vec4:       'https://www.figma.com/api/mcp/asset/61831faf-93c0-4e74-9964-b27ff6e42abc',
  newTab:     'https://www.figma.com/api/mcp/asset/cfe192dd-ad29-4c9b-b550-468533e27369',
  returnIc:   'https://www.figma.com/api/mcp/asset/48b2e81d-1719-4f40-9bd4-77208587cc31',
  forwardIc:  'https://www.figma.com/api/mcp/asset/3d1bb03c-8430-4330-b737-02fc23b2a309',
  refreshIc:  'https://www.figma.com/api/mcp/asset/970996e6-9b0d-40b2-af92-a7b68a3070ea',
  lockIc:     'https://www.figma.com/api/mcp/asset/c60e85d7-b37a-4e5b-a5ca-11328878f8d7',
  avatar:     'https://www.figma.com/api/mcp/asset/6c6bacf1-1076-4070-b627-57ffd3247d75',
  bkmrk1:     'https://www.figma.com/api/mcp/asset/4bf91d44-4576-4978-b6f6-ab5182329eaf',
  bkmrk2:     'https://www.figma.com/api/mcp/asset/e2ddf015-c2ce-4527-a81c-99172dfd0c23',
  ariaOrb:    'https://www.figma.com/api/mcp/asset/6973dd50-be93-4921-8b5d-90fa580ad62b',
  globe:      'https://www.figma.com/api/mcp/asset/29958fb3-553d-4ff9-9caa-72541d2d1341',
  arrowL:     'https://www.figma.com/api/mcp/asset/d600c2c0-6f2c-4ed4-81a0-ed7af4f929b7',
  arrowR:     'https://www.figma.com/api/mcp/asset/3ef3d7d9-477a-4e47-b741-a3e85fb34cd0',
  chevronR:   'https://www.figma.com/api/mcp/asset/5d1f22c6-7c72-4a3c-a352-fa885f11d0e2',
  tmpl1:      'https://www.figma.com/api/mcp/asset/4d3c4917-3766-4f5b-ad13-0d22dff33cc6',
  tmpl2:      'https://www.figma.com/api/mcp/asset/dbc8aa5b-0e97-4f7b-b1a3-6825402bd0bc',
  tmpl3:      'https://www.figma.com/api/mcp/asset/ad30e7ad-a9d8-4d2e-84a6-3e2918da799c',
  tmpl4:      'https://www.figma.com/api/mcp/asset/7c423558-168b-471b-aca6-ce755a257a2c',
  tmpl5:      'https://www.figma.com/api/mcp/asset/08f42b65-5d84-4b6b-9c5d-9799c8b60447',
  tmpl6:      'https://www.figma.com/api/mcp/asset/cbc979c6-9bed-426c-8ba4-2171a32c694f',
};

const DEV_PRESETS = [
  { label: 'Regular site', host: 'example.com' },
  { label: 'mystore.s', host: 'mystore.shopify.com', badge: 'Shopify', badgeColor: '#1A8A5A', badgeBg: '#EDFAF3' },
  { label: 'store.woo', host: 'store.woocommerce.com', badge: 'WooCommerce', badgeColor: '#7B3FC4', badgeBg: '#F3EEFF' },
];

function FigmaEntryScreen({ onGenerate }) {
  const [importedSite, setImportedSite] = hs(null);
  const [showImport, setShowImport] = hs(false);
  const [undoSite, setUndoSite] = hs(null);
  const [hovUrl, setHovUrl] = hs(false);
  const [tweaksOpen, setTweaksOpen] = hs(false);
  const [importPreset, setImportPreset] = hs(null); // { host } to pre-load in modal
  const undoTimer = hr(null);

  const removeSite = () => {
    const s = importedSite;
    setImportedSite(null);
    setUndoSite(s);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoSite(null), 4000);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(169deg, #F6F6F6 8.4%, #F0F0F0 61.3%)', fontFamily: '"Wix Madefor Text", sans-serif', overflowX: 'hidden' }}>

      {/* ── Page nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px' }}>
        <button className="hbtn hbtn-ghost" style={{ ...hBtnGhost('small'), color: '#000624', gap: 6 }}>
          <HIc name="arrow-left" size={18} color="#000624" />
          Back
        </button>
        <button className="hbtn hbtn-ghost" style={{ ...hBtnGhost('small'), color: '#000624', gap: 6 }}>
          Continue with setup for now
          <HIc name="arrow-right" size={18} color="#000624" />
        </button>
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56, padding: '16px 0 48px' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 48, fontWeight: 500, fontFamily: '"Wix Madefor Display", sans-serif', color: '#000624', lineHeight: 1.15 }}>Design your site with Aria</h1>
          <p style={{ margin: 0, fontSize: 18, color: '#868AA5', fontWeight: 400 }}>Describe the site you want, Aria will generate it and stay by your side as you work.</p>
        </div>

        {/* Chat input card */}
        <div style={{ width: 720, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
          {/* Aria status line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E1E2E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HAria size={20} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, background: 'linear-gradient(90deg, #315FFF, #1D3999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aria is generating a prompt based on your site info...</span>
          </div>

          {/* Card */}
          <div style={{ background: 'linear-gradient(204deg, rgba(206,255,126,0.1) 20%, rgba(255,255,255,0) 87%), #F6F7F9', borderRadius: 12, padding: 12, boxShadow: '0 12px 8px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Text area */}
            <div style={{ background: '#fff', borderRadius: 8, padding: '9px 12px', boxShadow: '-117px 128px 24.5px rgba(16,21,133,0), -75px 82px 22px rgba(16,21,133,0.01), -24px 24px 12px rgba(16,21,133,0.03), -5px 5px 7.5px rgba(16,21,133,0.07)', minHeight: 78 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#000624', lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                Create a bright, modern website for "Happy Moments", a shoe store in Tel Aviv, using soft sky blue, warm coral, and clean white for a cheerful, welcoming vi..
              </p>
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Create from URL — Default or Added state */}
              {importedSite ? (
                /* ── Added state ── */
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setShowImport(true)} className="hbtn hbtn-secondary" style={{ ...hBtnSecondary('small'), borderRadius: 24, gap: 6 }}>
                    <HIc name="link" size={14} color="#32324D" />
                    Create from URL
                  </button>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 30, padding: '0 10px', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 24, fontSize: 12, color: '#32324D', fontFamily: 'inherit', fontWeight: 600 }}>
                    <img src={`https://www.google.com/s2/favicons?domain=${importedSite.host}&sz=32`} width={13} height={13} style={{ borderRadius: 2, flexShrink: 0, display: 'block' }} onError={e => { e.target.style.display='none'; }} />
                    <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{importedSite.host}</span>
                    {importedSite.isShopify && <span style={{ background: '#EDFAF3', borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#1A8A5A' }}>Shopify</span>}
                    <button onClick={removeSite} style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 0, marginLeft: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="#888" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Default state — WDS toggle/pill with hover tooltip ── */
                <div style={{ position: 'relative', display: 'inline-flex' }}
                  onMouseEnter={() => setHovUrl(true)}
                  onMouseLeave={() => setHovUrl(false)}
                >
                  <button onClick={() => setShowImport(true)} className="hbtn" style={{ ...hBtnSecondary('small'), borderRadius: 24, gap: 6, background: hovUrl ? '#fff' : 'transparent', border: hovUrl ? '1px solid #E0E0E0' : '1px solid transparent', transition: 'background 150ms, border-color 150ms' }}>
                    <HIc name="globe" size={14} color="#32324D" />
                    Create from URL
                  </button>
                  {hovUrl && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, zIndex: 200, width: 240, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
                      {/* Arrow */}
                      <div style={{ position: 'absolute', bottom: -6, left: 18, width: 12, height: 12, background: '#fff', transform: 'rotate(45deg)', boxShadow: '2px 2px 6px rgba(0,0,0,0.08)' }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1E2E' }}>Create from URL</div>
                      <div style={{ fontSize: 12, color: '#555566', lineHeight: 1.5 }}>Use any existing website as a starting point — Aria will import its structure, style &amp; content.</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                        {[
                          { icon: '🏗️', label: 'Structure', desc: 'Pages, sections & layout' },
                          { icon: '🎨', label: 'Style', desc: 'Colors, fonts & imagery' },
                          { icon: '📄', label: 'Content', desc: 'Text, products & info' },
                        ].map(({ icon, label, desc }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14 }}>{icon}</span>
                            <span style={{ fontSize: 11, color: '#32324D' }}><b>{label}</b> — {desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate Site button */}
              <button className="hbtn" style={{ ...hBtnPrimary('medium'), background: '#116DFF' }}>
                Generate Site
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: '#868AA5' }}>AI can make mistakes. Always double-check the results</p>
        </div>
      </div>

      {/* ── Template section ── */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ background: 'rgba(246,246,246,0.7)', backdropFilter: 'blur(10px)', borderRadius: 24, padding: 40, display: 'flex', flexDirection: 'column', gap: 40, boxShadow: 'inset 1px 1px 1px rgba(255,255,255,0.8), inset -1px -1px 1px rgba(255,255,255,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 18, fontWeight: 600, fontFamily: '"Wix Madefor Display", sans-serif', color: '#000' }}>Or, start from a template recommended for you.</span>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer', fontSize: 14, color: '#000624', fontFamily: 'inherit' }}>
              See All <img src={FG_ASSETS.chevronR} width={18} height={18} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              [FG_ASSETS.tmpl1, 'Beauty Salon'],
              [FG_ASSETS.tmpl2, 'Real Estate Landing Page'],
              [FG_ASSETS.tmpl3, 'Health care'],
            ].map(([src, label]) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <img src={src} style={{ width: '100%', borderRadius: 8, display: 'block', boxShadow: '0 10px 9px rgba(0,0,0,0.08)' }} />
                <span style={{ fontSize: 14, color: '#000624' }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              [FG_ASSETS.tmpl4, 'Fitness app site'],
              [FG_ASSETS.tmpl5, 'Portfolio Site'],
              [FG_ASSETS.tmpl6, 'Health Care Landing Page (Fresh)'],
            ].map(([src, label]) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <img src={src} style={{ width: '100%', borderRadius: 8, display: 'block', boxShadow: '0 10px 9px rgba(0,0,0,0.08)' }} />
                <span style={{ fontSize: 14, color: '#000624' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating dev tweaks panel ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        {tweaksOpen && (
          <div style={{ background: '#1E1E2E', borderRadius: 12, padding: '14px 16px', width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.30)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9090A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Dev — Simulate URL scan</div>
            {DEV_PRESETS.map(({ label, host, badge, badgeColor, badgeBg }) => (
              <button key={host} onClick={() => { setImportPreset({ host }); setShowImport(true); setTweaksOpen(false); }} style={{ textAlign: 'left', height: 30, padding: '0 10px', border: 0, borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', background: '#32324D', color: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                {label}
                {badge && <span style={{ background: badgeBg, borderRadius: 6, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: badgeColor }}>{badge}</span>}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setTweaksOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', border: 0, background: '#1E1E2E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#fff"/><circle cx="8" cy="8" r="1.5" fill="#fff"/><circle cx="8" cy="12" r="1.5" fill="#fff"/></svg>
        </button>
      </div>

      {/* ── ImportFlow modal ── */}
      {showImport && (
        <ImportFlow
          initialUrl={importPreset ? importPreset.host : ''}
          initialPhase={importPreset ? 'results' : 'url'}
          onClose={() => { setShowImport(false); setImportPreset(null); }}
          onImport={(site) => { setImportedSite(site); setShowImport(false); setImportPreset(null); }}
        />
      )}

      {/* ── Undo toast ── */}
      {undoSite && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#32324D', color: '#fff', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.22)', whiteSpace: 'nowrap' }}>
          <span>Removed <b>{undoSite.host}</b></span>
          <button onClick={() => { setImportedSite(undoSite); setUndoSite(null); clearTimeout(undoTimer.current); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 10px', cursor: 'pointer' }}>Undo</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HarmonyV11Screen — Harmony Creation V1.1 entry point
   Same ImportFlow modal as FigmaEntryScreen (shared component).
   ============================================================ */

function HarmonyV11Screen({ onGenerate }) {
  const [showImport, setShowImport] = hs(false);
  const [importPreset, setImportPreset] = hs(null);
  const [importedSite, setImportedSite] = hs(null);
  const [hovUrl, setHovUrl] = hs(false);
  const [tweaksOpen, setTweaksOpen] = hs(false);

  const EXAMPLE_PROMPTS = ['Fashion store', 'Online course', 'Wellness service', 'Consulting website', 'Community hub', 'Creative portfolio'];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'radial-gradient(ellipse 90% 55% at 50% 130%, rgba(225,237,255,0.95) 0%, rgba(255,255,255,0) 70%), #f6f6f6', fontFamily: '"Wix Madefor Text", sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, padding: '0 56px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Wix wordmark */}
          <svg width="40" height="22" viewBox="0 0 80 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="22" fontSize="26" fontWeight="900" fontFamily="'Wix Madefor Display', Arial, sans-serif" fill="#000">Wix</text>
          </svg>
          {/* Avatar placeholder */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #2f5dff', background: '#dde8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2f5dff', flexShrink: 0 }}>N</div>
        </div>
        <button style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#2f5dff', fontFamily: 'inherit' }}>Upgrade</button>
      </div>

      {/* ── Main stage ── */}
      <div style={{ flex: 1, padding: '0 130px', maxWidth: 1440, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Heading block */}
        <div style={{ paddingTop: 46, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Aria greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E1E2E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HAria size={22} />
            </div>
            <div style={{ fontSize: 34, fontWeight: 400, fontFamily: '"Wix Madefor Display", sans-serif', letterSpacing: '-0.8px', lineHeight: '39.1px', background: 'linear-gradient(90deg, #315FFF 0%, #1D3999 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hi! I'm Aria, your friendly design assistant.
            </div>
          </div>
          {/* Subtitle */}
          <div style={{ fontSize: 32, fontWeight: 400, fontFamily: '"Wix Madefor Display", sans-serif', letterSpacing: '-0.8px', lineHeight: '36.8px', color: '#151414' }}>
            Tell me your site's{' '}<span style={{ color: '#2f5dff' }}>name</span>, what kind of{' '}
            <span style={{ color: '#2f5dff' }}>business it is,</span> and what{' '}
            <span style={{ color: '#2f5dff' }}>makes it unique.</span>
          </div>
        </div>

        {/* Composer card */}
        <div style={{ marginTop: 40, borderRadius: 24, background: '#fff', border: '1.5px solid #9db9ff', padding: '26px 28px 18px', minHeight: 296, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 2px rgba(0,6,36,0.05), 0 0 3px rgba(0,6,36,0.1)', position: 'relative' }}>
          {/* Textarea */}
          <textarea
            placeholder="Describe the site you want to build…"
            style={{ flex: 1, width: '100%', fontSize: 22, fontFamily: '"Wix Madefor Text", sans-serif', color: '#767574', border: 0, outline: 0, resize: 'none', lineHeight: '29.7px', background: 'transparent', minHeight: 168, boxSizing: 'border-box', '::placeholder': { color: '#767574' } }}
          />
          {/* Composer footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            {/* Create from URL text button */}
            <div style={{ position: 'relative', display: 'inline-flex' }}
              onMouseEnter={() => setHovUrl(true)}
              onMouseLeave={() => setHovUrl(false)}
            >
              <button onClick={() => setShowImport(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 0, cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#151414', fontFamily: 'inherit', padding: '8px 12px', borderRadius: 24 }}>
                <HIc name="globe" size={18} color="#151414" />
                Create from URL
              </button>
              {hovUrl && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, zIndex: 200, width: 240, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', bottom: -6, left: 18, width: 12, height: 12, background: '#fff', transform: 'rotate(45deg)', boxShadow: '2px 2px 6px rgba(0,0,0,0.08)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1E2E' }}>Create from URL</div>
                  <div style={{ fontSize: 12, color: '#555566', lineHeight: 1.5 }}>Use any existing website as a starting point — Aria will import its structure, style &amp; content.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                    {[
                      { icon: '🏗️', label: 'Structure', desc: 'Pages, sections & layout' },
                      { icon: '🎨', label: 'Style', desc: 'Colors, fonts & imagery' },
                      { icon: '📄', label: 'Content', desc: 'Text, products & info' },
                    ].map(({ icon, label, desc }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{icon}</span>
                        <span style={{ fontSize: 11, color: '#32324D' }}><b>{label}</b> — {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Site button */}
            <button className="hbtn" style={{ ...hBtnPrimary('medium'), background: '#2f5dff', gap: 10, borderRadius: 12, boxShadow: '0 4px 7px rgba(47,93,255,0.35)' }}>
              Generate Site
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Example prompts */}
        <div style={{ marginTop: 40, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#151414' }}>Try an example prompt</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLE_PROMPTS.map(p => (
              <button key={p} style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid #fff', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#383838', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '1px 8px 17px rgba(120,150,255,0.08)' }}>{p}</button>
            ))}
            <button style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px solid #fff', borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 500, color: '#2f5dff', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '1px 8px 17px rgba(120,150,255,0.08)' }}>
              <HIc name="refresh" size={16} color="#2f5dff" />
              More Ideas
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px 32px', fontSize: 13, color: '#6b6b6f', flexShrink: 0 }}>AI can make mistakes. Double check the results.</div>

      {/* ── Floating dev tweaks panel ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        {tweaksOpen && (
          <div style={{ background: '#1E1E2E', borderRadius: 12, padding: '14px 16px', width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.30)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9090A8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Dev — Simulate URL scan</div>
            {DEV_PRESETS.map(({ label, host, badge, badgeColor, badgeBg }) => (
              <button key={host} onClick={() => { setImportPreset({ host }); setShowImport(true); setTweaksOpen(false); }} style={{ textAlign: 'left', height: 30, padding: '0 10px', border: 0, borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', background: '#32324D', color: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                {label}
                {badge && <span style={{ background: badgeBg, borderRadius: 6, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: badgeColor }}>{badge}</span>}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setTweaksOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', border: 0, background: '#1E1E2E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#fff"/><circle cx="8" cy="8" r="1.5" fill="#fff"/><circle cx="8" cy="12" r="1.5" fill="#fff"/></svg>
        </button>
      </div>

      {/* ── ImportFlow modal (shared component) ── */}
      {showImport && (
        <ImportFlow
          initialUrl={importPreset ? importPreset.host : ''}
          initialPhase={importPreset ? 'results' : 'url'}
          onClose={() => { setShowImport(false); setImportPreset(null); }}
          onImport={(site) => { setImportedSite(site); setShowImport(false); setImportPreset(null); }}
        />
      )}
    </div>
  );
}

/* ============================================================
   Intro screens (4 static pre-funnel screens)
   ============================================================ */

const imgScreen = (src) => () => <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }} />;

const IntroScreen1 = imgScreen('wds/1.png');
const IntroScreen2 = imgScreen('wds/2.png');
const IntroScreen3 = imgScreen('wds/3.png');
const IntroScreen4 = imgScreen('wds/4.png');

const INTRO_SCREENS = [IntroScreen1, IntroScreen2, IntroScreen3, IntroScreen4];

function App() {
  const [step, setStep] = hs(window.START_STEP ?? 0); // 0-3 = intro screens, 4 = HomeFlow, 5/6 = GeneratingScreen phases
  const [genPrompt, setGenPrompt] = hs('');

  he(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setStep(s => Math.max(s - 1, 0));
      if (step < 4 && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) setStep(s => Math.min(s + 1, 4));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  if (step === 'figma') return <FigmaEntryScreen onGenerate={(p) => { setGenPrompt(p); setStep(5); }} />;
  if (step === 'v11') return <HarmonyV11Screen onGenerate={(p) => { setGenPrompt(p); setStep(5); }} />;
  if (step >= 5) return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <GeneratingScreen prompt={genPrompt} />
      <button onClick={() => setStep(4)}
        style={{ position: 'absolute', bottom: 28, left: 28, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontFamily: 'inherit', zIndex: 100 }}>‹</button>
    </div>
  );
  if (step >= 4) return <HomeFlow onGenerate={(p) => { setGenPrompt(p); setStep(5); }} />;

  const Screen = INTRO_SCREENS[step];
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
         onClick={() => setStep(s => Math.min(s + 1, 4))}>
      <Screen />
      {/* Arrow nav */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 100 }}>
        {step > 0 && (
          <button onClick={e => { e.stopPropagation(); setStep(s => s - 1); }}
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontFamily: 'inherit' }}>‹</button>
        )}
        <button onClick={e => { e.stopPropagation(); setStep(s => Math.min(s + 1, 4)); }}
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontFamily: 'inherit' }}>›</button>
      </div>
    </div>
  );
}

window.HomeFlow = HomeFlow;
window.HarmonyApp = App;