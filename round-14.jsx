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

function AttachmentChip({ name, onRemove }) {
  const [hovered, setHovered] = hs(false);
  const hoverProps = onRemove ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } : {};

  /* URL variant — globe icon */
  if (isUrl(name)) {
    const display = name.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return (
      <span {...hoverProps} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1px solid #E8E7E7', borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 4, paddingBottom: 4, paddingLeft: 6, paddingRight: onRemove ? 16 : 10 }}>
          <GlobeIcon />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#151414', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{display}</span>
        </span>
        {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={false} />}
      </span>
    );
  }

  /* Image variant — Figma node 23:884 — 48×48 thumbnail */
  if (isImage(name)) {
    return (
      <span {...hoverProps} style={{ position: 'relative', display: 'inline-flex', width: 48, height: 48, borderRadius: 8, border: '1px solid rgba(19,23,32,0.1)', overflow: 'hidden', flexShrink: 0 }}>
        <img src={imgSrc(name)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {onRemove && hovered && <CloseBtn onRemove={onRemove} transparent={true} />}
      </span>
    );
  }

  /* File variant — Figma node 23:840 */
  return (
    <span {...hoverProps} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1px solid #E8E7E7', borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
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
  const [imported, setImported] = hs(false);
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
  const placeholderText = ready ? '' : (asset || refs.length || imported) ? 'You can add here instructions to Aria…' : 'Tell me about your site, or drop a URL to get started…';
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
        setAsset(true); setAssetFiles(prev => { const newOnes = names.filter(n => !prev.includes(n)); return [...prev, ...newOnes]; });
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
  const hasContent = asset || refs.length > 0 || imported;
  const btnLabel = ready ? 'Generate Site' : 'Continue with Aria';
  // Headline: in ready state, use readyKey (not always '111')
  const readyHeadlineKey = readyKey;
  const READY_HEADLINE = readyKey === '111'
    ? HEADLINE_STATES['111']
    : { l1: "We're still missing a few things.", l2Parts: HEADLINE_STATES[readyKey]?.l2Parts || HEADLINE_STATES['000'].l2Parts };
  const hs_ = (ready || transitioning) ? READY_HEADLINE : HEADLINE_STATES[stateKey];

  const buildAriaTouch = () => {
    const parts = [];
    if (asset && assetFiles.length) parts.push(`Based on your ${assetFiles.length > 1 ? assetFiles.length + ' files' : assetFiles[0]}, I'll extract your brand colors, imagery and key visuals.`);
    else if (asset) parts.push("I'll extract your brand colors, imagery and key visuals from the uploaded files.");
    if (refs.length) parts.push(`From the reference ${refs.length > 1 ? 'sites' : 'site'} I'll borrow the visual style, layout language and editorial feel.`);
    if (imported) parts.push("I'll import your existing content, products and structure from your current site.");
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
  const confirmAsset = (names) => {
    setAsset(true);
    const arr = Array.isArray(names) ? names : ['logo.png'];
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
              {/* attachment chips */}
              {(asset || refs.length > 0 || imported) &&
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '16px 28px 6px' }}>
                  {asset && (assetFiles.length ? assetFiles : ['logo.png']).slice(0, 9).map((nm, i) =>
                    <AttachmentChip key={i} name={nm} onRemove={() => { const removed = nm; const removedIndex = i; const next = (assetFiles.length ? assetFiles : ['logo.png']).filter((_, idx) => idx !== removedIndex); setAssetFiles(next); if (!next.length) setAsset(false); showUndo(removed, () => { setAssetFiles(prev => { const arr = [...prev]; arr.splice(removedIndex, 0, removed); return arr; }); setAsset(true); }); }} />
                  )}
                  {asset && assetFiles.length > 9 && (
                    <FolderChip
                      files={assetFiles.slice(9)}
                      onRemoveFile={(idx) => {
                        const realIdx = 9 + idx;
                        const removed = assetFiles[realIdx];
                        const next = assetFiles.filter((_, i) => i !== realIdx);
                        setAssetFiles(next);
                        if (!next.length) setAsset(false);
                        showUndo(removed, () => { setAssetFiles(prev => { const arr = [...prev]; arr.splice(realIdx, 0, removed); return arr; }); setAsset(true); });
                      }}
                    />
                  )}
                  {refs.map((r, i) => <AttachmentChip key={i} name={r} onRemove={() => { const removed = r; const idx = i; setRefs(prev => prev.filter((_, j) => j !== idx)); showUndo(removed, () => setRefs(prev => { const arr = [...prev]; arr.splice(idx, 0, removed); return arr; })); }} />)}
                  {imported && <AttachmentChip name="mysite.myshopify.com" onRemove={() => { setImported(false); showUndo('mysite.myshopify.com', () => setImported(true)); }} />}
                </div>
              }

              {/* Undo toast */}

              {/* text area / transition view */}
              {transitioning ?
                <div style={{ flex: 1, padding: '24px 28px 18px', fontSize: 32, lineHeight: 1.5, minHeight: 200 }}>
                  <span style={{ color: H_INK, fontWeight: 600 }}>{prompt}</span>
                  {ariaTouch ? <span> <TypewriterInline key={ariaTouch} text={ariaTouch} color="#5B7FFF" delay={600} /></span> : null}
                </div> :
                <div style={{ flex: 1, position: 'relative', minHeight: 200, maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* visual spacer for height */}
                  <div aria-hidden="true" style={{ padding: '24px 28px 0', fontSize: 32, lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word', visibility: 'hidden' }}>
                    {prompt || ' '}
                    {ready && ariaTouch ? <span> {ariaTouch}</span> : null}
                  </div>
                  {/* overlay: prompt (transparent) + ariaTouch in purple */}
                  <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 28px 0', fontSize: 32, lineHeight: 1.5, pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
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
                      if (!val && !asset && !refs.length && !imported) { setScreen('empty'); setEmptyKey(k => k + 1); }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !ov) {
                        const canContinue = prompt.trim() || asset || refs.length || imported;
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
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', boxSizing: 'border-box', border: 0, outline: 'none', resize: 'none', background: 'transparent', padding: '24px 28px', fontSize: 32, lineHeight: 1.5, color: H_INK, fontFamily: 'inherit', overflowY: 'auto', zIndex: 1 }} />
                  {/* custom placeholder with crossfade */}
                  {!prompt && placeholderText && (
                    <div key={placeholderKey} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 28px 0', fontSize: 32, lineHeight: 1.5, color: '#AAAAAA', pointerEvents: 'none', animation: 'placeholder-fadein 320ms ease', zIndex: 0 }}>
                      {placeholderText}
                    </div>
                  )}
                </div>
              }


              {/* action row */}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 17, paddingBottom: 5, paddingLeft: 14, paddingRight: 14, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {/* Add dropdown */}
                  {ov === 'dropdown' &&
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, width: 280, background: '#fff', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 6, zIndex: 30, animation: 'h-menu 160ms ease-out' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px 4px' }}>Add to your prompt</div>
                      <DropRow icon="image" icon2="document" bg="#FFF0E8" fg="#C05B2A" title="Add photos or files" desc="Images, videos, PDFs &amp; more" onClick={() => setOv('assets')} />
                      <DropRow icon="link" bg="#EDE9FF" fg="#6040D0" title="Add a reference site" desc="Give Aria a look & feel to start from" onClick={() => setOv('url')} />
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', height: 'var(--wds-badge-size-tiny, 20px)', padding: '0 var(--wds-badge-padding-horizontal-tiny, 6px)', borderRadius: 'var(--wds-badge-border-radius-tiny, 4px)', background: '#DFF994', fontSize: 12, fontWeight: 600, lineHeight: 1, color: '#2D8A4E', flexShrink: 0 }}>Beta</span>
                </button>
                <div style={{ flex: 1 }} />
                <span style={{ position: 'relative', display: 'inline-flex' }}
                    onMouseEnter={() => { const d = (!prompt.trim() && !asset && !refs.length && !imported) || continuing; if (d) setShowContinueTip(true); }}
                    onMouseLeave={() => setShowContinueTip(false)}>
                  {(() => { const isDisabled = (!prompt.trim() && !asset && !refs.length && !imported) || continuing; return (
                    <button className="hbtn" onClick={!isDisabled ? () => { setContinuing(true); setTimeout(() => { setContinuing(false); onGenerate && onGenerate(prompt); }, 600); } : undefined} disabled={isDisabled}
                      style={{ ...hBtnPrimary('medium'), opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', minWidth: 152, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: isDisabled ? 'none' : 'auto' }}>
                      {continuing ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'h-spin 0.8s linear infinite' }} />Loading…</> : 'Generate site'}
                    </button>
                  ); })()}
                  {showContinueTip && (!prompt.trim() && !asset && !refs.length && !imported) && (
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

            {/* templates panel */}
            <div style={{ marginTop: 28, background: 'rgba(255,255,255,0.5)', borderRadius: 16, padding: '28px 32px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: H_INK }}>
                  {'Or start with a stunning template'}
                </div>
                <a href="https://www.wix.com/website/templates" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: H_BLUE, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>See all <HIc name="chevronRight" size={14} color={H_BLUE} /></a>
              </div>
              {/* Search bar — underline style */}
              <div style={{ position: 'relative', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '2px solid #3B4EF5', paddingBottom: 8 }}>
                <HIc name="search" size={18} color="#6B7280" />
                <input
                  type="text"
                  value={tplSearch}
                  onChange={e => { setTplSearch(e.target.value); setShowMore(true); }}
                  placeholder="Search all templates..."
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, color: H_INK, fontFamily: 'inherit', outline: 'none', padding: 0 }}
                />
                {tplSearch && (
                  <button onClick={() => setTplSearch('')} style={{ background: 'none', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2, color: '#9A9AB0' }}>
                    <HIc name="close" size={14} color="#9A9AB0" />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {(() => {
                  const ALL_TPL_POOL = [...TPL_GENERAL, ...TPL_FASHION, ...TPL_WELLNESS, ...TPL_FOOD, ...TPL_PORTFOLIO, ...TPL_STORE, ...TPL_BUSINESS];
                  const deduped = ALL_TPL_POOL.filter((item, idx, arr) => arr.findIndex(x => x[0] === item[0]) === idx);
                  const q = tplSearch.trim();
                  const basePool = q ? deduped.filter(([n]) => n.toLowerCase().includes(q.toLowerCase())) : TPL_GENERAL;
                  const visible = (q || showMore) ? basePool : basePool.slice(0, 9);
                  if (!visible.length) return [<div key="empty" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px 0', color: H_MUTED, fontSize: 14 }}>No templates found for "{tplSearch}"</div>];
                  return visible.map(([name, imgId], i) =>
                    <div key={i}>
                      <div className="hf-tcard" style={{ position: 'relative', height: 188, borderRadius: 12, border: '1px solid #E8E8F0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(80,80,140,0.06)', cursor: 'pointer' }}>
                        <TBrowser bar='#fff'>
                          <TplImg id={imgId} />
                        </TBrowser>
                        <div className="hf-scrim" style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0, transition: 'opacity 180ms ease', pointerEvents: 'none' }}>
                          <button className="hbtn" style={{ ...hBtn('medium'), width: 96, background: '#1E1E2E', color: '#fff' }}>Edit</button>
                          <button className="hbtn hbtn-secondary" style={{ ...hBtn('medium'), width: 96, background: 'transparent', color: '#1E1E2E', border: '1px solid #1E1E2E' }}>View</button>
                          <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 12, fontWeight: 500, color: '#32324D' }}>Info</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: H_INK, marginTop: 10 }}>{name}</div>
                    </div>
                  );
                })()}
              </div>
              {!showMore && !tplSearch.trim() &&
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button onClick={() => setShowMore(true)} className="hbtn hbtn-secondary" style={{ ...hBtnSecondary('medium'), background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.12)', color: H_INK }}>
                    Show more templates <HIc name="chevronRight" size={13} color={H_MUTED} />
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        {/* dropdown dismiss scrim */}
        {ov === 'dropdown' && <div onClick={() => setOv(null)} style={{ position: 'absolute', inset: 0, zIndex: 20 }} />}

        {/* modals */}
        {ov === 'assets' && <AssetsModal onClose={closeOverlay} onAdd={confirmAsset} />}
        {ov === 'extract' && <ExtractModal onClose={closeOverlay} onAdd={confirmAsset} />}
        {ov === 'url' && <UrlModal onClose={closeOverlay} onAdd={confirmRef} onBack={() => setOv('dropdown')} />}
        {ov === 'import-url' && <ImportFlow onClose={closeOverlay} onImport={() => {setImported(true);if (screen === 'empty') setScreen('text');setOv(null);}} />}

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


function AssetsModal({ onClose, onAdd }) {
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
        <div style={{ fontSize: 17, fontWeight: 700, color: H_INK }}>Add photos or files</div>
        <div style={{ fontSize: 12, color: H_MUTED, marginTop: 2 }}>Images, videos, PDFs, docs and more</div>
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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><HIc name="askAi" size={14} color={H_BLUE} /></span>
          <span style={{ fontSize: 12, color: H_BLUE, lineHeight: 1.5 }}>Anything you'd put on your site — images, logos, docs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><HIc name="askAi" size={14} color={H_BLUE} /></span>
          <span style={{ fontSize: 12, color: H_BLUE, lineHeight: 1.5 }}>Aria will extract the content and visuals for you</span>
        </div>
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

function UrlModal({ onClose, onAdd, onBack }) {
  const [phase, setPhase] = hs('url'); // 'url' | 'scanning' | 'results' | 'error'
  const [url, setUrl] = hs('');
  const [inspoHover, setInspoHover] = hs(false);
  const isValidUrl = (u) => /^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(u.trim());
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || '';
  const fetch_ = () => {
    if (!isValidUrl(url)) { setPhase('error'); return; }
    setPhase('scanning');
    setTimeout(() => setPhase('results'), 1600);
  };
  const hInput = { height: 38, boxSizing: 'border-box', padding: '0 12px', border: `1px solid ${phase === 'error' ? '#D32F2F' : '#C1C2C3'}`, borderRadius: 8, fontSize: 14, color: '#32324D', outline: 'none', fontFamily: 'inherit', background: '#fff', width: '100%', transition: 'border-color 120ms, box-shadow 120ms' };
  const wideShell = { ...shell, width: 520, maxWidth: '95vw', borderRadius: 16 };

  return <Overlay><div onClick={(e) => e.stopPropagation()} style={wideShell}>
    {/* header */}
    <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F4' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: H_INK }}>Add a reference site</div>
        <div style={{ fontSize: 13, color: H_MUTED, marginTop: 3 }}>Paste a link to a site you love — Aria will match its style.</div>
      </div>
      <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 6, marginTop: -2, borderRadius: 6, color: '#888898', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="#888898" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </button>
    </div>

    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* URL input row — always visible */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="h-input"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (phase === 'error') setPhase('url'); }}
            onKeyDown={(e) => e.key === 'Enter' && fetch_()}
            placeholder="Paste any address or URL"
            style={{ ...hInput, flex: 1, width: 'auto' }}
          />
          <button
            className="hbtn"
            onClick={fetch_}
            disabled={!url.trim()}
            style={{ ...hBtnPrimary('medium'), flexShrink: 0, opacity: url.trim() ? 1 : 0.4, cursor: url.trim() ? 'pointer' : 'not-allowed' }}
          >
            {phase === 'results' ? 'Refresh' : 'Get'}
          </button>
        </div>
        {phase === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FFF3F3', border: '1px solid #FFCDD2', borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#D32F2F" strokeWidth="1.4"/><path d="M8 4.5V8.5" stroke="#D32F2F" strokeWidth="1.6" strokeLinecap="round"/><circle cx="8" cy="11" r="1" fill="#D32F2F"/></svg>
            <span style={{ fontSize: 12, color: '#B71C1C' }}>Couldn't reach this site. Check the URL and try again.</span>
          </div>
        )}
      </div>

      {/* scanning */}
      {phase === 'scanning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ width: '100%', height: 4, background: '#EEEEF6', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', background: '#2F5DFF', borderRadius: 4, transition: 'width 1.4s ease' }} />
          </div>
          <div style={{ fontSize: 13, color: H_MUTED }}>Getting {host}…</div>
        </div>
      )}

      {/* results — preview card */}
      {phase === 'results' && (
        <div style={{ border: '1px solid #C1C2C3', borderRadius: 10, overflow: 'hidden', animation: 'h-fade 300ms ease' }}>
          {/* browser chrome */}
          <div style={{ height: 20, background: '#F5F6FA', display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', borderBottom: '1px solid #E8E8F0' }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: ['#FF5F57','#FEBC2E','#28C840'][i] }} />)}
            <span style={{ flex: 1, height: 14, background: '#EAEBF0', borderRadius: 4, marginLeft: 8 }} />
          </div>
          {/* screenshot — live */}
          <div style={{ height: 120, overflow: 'hidden', background: '#EEF4FF' }}>
            <img src={`https://image.thum.io/get/width/640/crop/400/${url.startsWith('http') ? url : 'https://' + url}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          </div>
          {/* site info */}
          <div style={{ padding: '10px 14px', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#3D5ECC" strokeWidth="1.3"/><path d="M8 1.5C8 1.5 5.5 4.5 5.5 8C5.5 11.5 8 14.5 8 14.5M8 1.5C8 1.5 10.5 4.5 10.5 8C10.5 11.5 8 14.5 8 14.5M1.5 8H14.5" stroke="#3D5ECC" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: H_INK }}>{host}</div>
              <div style={{ fontSize: 11, color: H_MUTED }}>Reference site added</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="#2D8A4E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      )}

      {/* or browse — shown only in url/error phase */}
      {(phase === 'url' || phase === 'error') && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, height: 1, background: '#F0F0F8' }} />
            <span style={{ fontSize: 11, color: '#AAAAAA' }}>or browse for inspiration</span>
            <span style={{ flex: 1, height: 1, background: '#F0F0F8' }} />
          </div>
          <button onClick={() => {}} onMouseEnter={() => setInspoHover(true)} onMouseLeave={() => setInspoHover(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', textAlign: 'left', padding: '12px 14px', border: `1px solid ${inspoHover ? '#C8D0F0' : '#E0E0EC'}`, borderRadius: 10, background: inspoHover ? '#F4F7FF' : '#fff', cursor: 'pointer', fontFamily: 'inherit', overflow: 'visible', transition: 'background 120ms, border-color 120ms' }}>
            <PhotoFan />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: H_INK }}>Wix Inspirations</span>
              <span style={{ display: 'block', fontSize: 11, color: H_MUTED, marginTop: 2 }}>Browse curated sites by style &amp; category</span>
            </span>
            <HIc name="chevronRight" size={14} color="#AAAAAA" />
          </button>
        </>
      )}
    </div>

    {/* footer */}
    <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #F0F0F4', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button>
      {phase === 'results' && (
        <button onClick={() => onAdd(host)} className="hbtn" style={addB}>Add reference →</button>
      )}
    </div>
  </div></Overlay>;
}

function ImportFlow({ onClose, onImport }) {
  const [phase, setPhase] = hs('url'); // 'url' | 'scanning' | 'results' | 'error'
  const [url, setUrl] = hs('');
  const [sel, setSel] = hs('both');
  const isValidUrl = (u) => /^(https?:\/\/)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(u.trim());
  const scan = () => {
    if (!isValidUrl(url)) { setPhase('error'); return; }
    setPhase('scanning');
    setTimeout(() => setPhase('results'), 1600);
  };
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'mysite.myshopify.com';

  /* ── Demo flag: always show Shopify for demo purposes ──────────
     To toggle off Shopify mode, change this to: false            */
  const isShopify = true;

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
        {/* icon + title inline */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: on ? '#32324D' : '#888' }}>{title}</span>
        </span>
        <span style={{ display: 'block', fontSize: 11, color: H_MUTED, marginTop: 5, lineHeight: 1.4 }}>{sub}</span>
        {shopifyNote && isShopify && (
          <span style={{ display: 'block', marginTop: 7, paddingTop: 7, borderTop: '1px solid rgba(17,109,255,0.15)', fontSize: 11, color: '#2F5DFF', fontWeight: 500 }}>✦ Includes products, categories &amp; prices</span>
        )}
      </button>
    );
  };

  /* shell override — wider for this modal */
  const wideShell = { ...shell, width: 580, maxWidth: '95vw', borderRadius: 16 };

  /* Harmony Input component style */
  const hInput = { height: 36, boxSizing: 'border-box', padding: '0 12px', border: '1px solid #C1C2C3', borderRadius: 8, fontSize: 14, color: '#32324D', outline: 'none', fontFamily: 'inherit', background: '#fff', width: '100%', transition: 'border-color 120ms, box-shadow 120ms' };

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

    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* URL label + input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="h-input" value={url} onChange={(e) => { setUrl(e.target.value); if (phase === 'error') setPhase('url'); }} onKeyDown={(e) => e.key === 'Enter' && scan()} placeholder="Paste any address or URL" style={{ ...hInput, flex: 1, width: 'auto', borderColor: phase === 'error' ? '#D32F2F' : undefined }} />
          <button className={phase === 'url' || phase === 'error' ? 'hbtn' : 'hbtn hbtn-secondary'} onClick={scan} style={{ ...(phase === 'url' || phase === 'error' ? hBtnPrimary('medium') : hBtnSecondary('medium')), flexShrink: 0 }}>{phase === 'url' || phase === 'error' ? 'Scan' : 'Re-scan'}</button>
        </div>
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

      {/* results */}
      {phase === 'results' &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'h-fade 300ms ease' }}>
          {/* full-width preview */}
          <div style={{ border: '1px solid #E0E0EE', borderRadius: 10, overflow: 'hidden' }}>
            {/* browser bar */}
            <div style={{ height: 22, background: '#F3F4F6', display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', borderBottom: '1px solid #EBEBEB' }}>
              {['#FF5F57','#FEBC2E','#28C840'].map((c) => <span key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
              <span style={{ flex: 1, height: 12, background: '#E4E5EA', borderRadius: 4, marginLeft: 8 }} />
            </div>
            {/* screenshot — live via thum.io */}
            <div style={{ height: 148, background: '#E8EAF0', overflow: 'hidden' }}>
              <img src={`https://image.thum.io/get/width/640/crop/400/${url.startsWith('http') ? url : 'https://' + url}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            </div>
            {/* footer row */}
            <div style={{ padding: '9px 14px', background: '#fff', borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#32324D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host}</span>
              {isShopify && <span style={{ background: '#EDFAF3', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1A8A5A', flexShrink: 0 }}>Shopify</span>}
            </div>
          </div>
          {/* green chip — always imported */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: '#F0FAF4', borderRadius: 8 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill="#2D8A4E"/><path d="M4 7L6 9.5L10 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 12, color: '#1E6B3E', fontWeight: 500 }}>All pages — always imported</span>
          </div>
          {/* options — side by side */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Opt id="both" title="Content & design" sub="Keep style & content" icon={<IconLayers active={sel === 'both'} />} shopifyNote />
            <Opt id="design" title="Design only" sub="Visual style only" icon={<IconPalette active={sel === 'design'} />} />
          </div>
        </div>
      }

      {/* legal banner */}
      {phase === 'results' &&
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#F3F4F8', borderRadius: 8, padding: '10px 14px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="7" stroke="#888898" strokeWidth="1.3"/><path d="M8 7.5V11" stroke="#888898" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="5.5" r="0.75" fill="#888898"/></svg>
          <span style={{ fontSize: 13, color: '#666677', lineHeight: 1.5 }}>Only use URLs where you have rights to the content.</span>
        </div>
      }
    </div>

    {/* footer */}
    <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #F0F0F4', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <button onClick={onClose} className="hbtn hbtn-secondary" style={cancelB}>Cancel</button>
      <button onClick={onImport} disabled={phase !== 'results'} className="hbtn" style={{ ...addB, opacity: phase === 'results' ? 1 : 0.4, cursor: phase === 'results' ? 'pointer' : 'not-allowed' }}>Add to Aria</button>
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
   Intro screens (4 static pre-funnel screens)
   ============================================================ */

const imgScreen = (src) => () => <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }} />;

const IntroScreen1 = imgScreen('wds/1.png');
const IntroScreen2 = imgScreen('wds/2.png');
const IntroScreen3 = imgScreen('wds/3.png');
const IntroScreen4 = imgScreen('wds/4.png');

const INTRO_SCREENS = [IntroScreen1, IntroScreen2, IntroScreen3, IntroScreen4];

function App() {
  const [step, setStep] = hs(0); // 0-3 = intro screens, 4 = HomeFlow, 5/6 = GeneratingScreen phases
  const [genPrompt, setGenPrompt] = hs('');

  he(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setStep(s => Math.max(s - 1, 0));
      if (step < 4 && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) setStep(s => Math.min(s + 1, 4));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

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