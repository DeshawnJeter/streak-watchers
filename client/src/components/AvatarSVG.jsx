// Duolingo-style layered SVG avatar.
// Config: { skinTone, hairStyle, hairColor, eyeStyle, mouthStyle, shirtColor, bgColor, headwear, faceDetail }

// ── Hair ─────────────────────────────────────────────────────────────────────
const HAIR = [
  null, // 0 = bald
  // 1 = short crop
  (c) => (
    <path
      d="M17 42 Q16 16 40 13 Q64 16 63 42 Q61 20 40 18 Q19 20 17 42Z"
      fill={c}
    />
  ),
  // 2 = long straight
  (c) => (
    <>
      <path d="M17 42 Q16 16 40 13 Q64 16 63 42 Q61 20 40 18 Q19 20 17 42Z" fill={c} />
      <path d="M17 42 Q14 58 16 72 Q19 62 22 54" fill={c} />
      <path d="M63 42 Q66 58 64 72 Q61 62 58 54" fill={c} />
    </>
  ),
  // 3 = curly afro
  (c) => (
    <>
      <ellipse cx="40" cy="15" rx="26" ry="12" fill={c} />
      <ellipse cx="18" cy="30" rx="9"  ry="12" fill={c} />
      <ellipse cx="62" cy="30" rx="9"  ry="12" fill={c} />
      <ellipse cx="29" cy="14" rx="9"  ry="7"  fill={c} />
      <ellipse cx="51" cy="14" rx="9"  ry="7"  fill={c} />
    </>
  ),
  // 4 = high bun
  (c) => (
    <>
      <path d="M17 42 Q16 16 40 13 Q64 16 63 42 Q61 20 40 18 Q19 20 17 42Z" fill={c} />
      <ellipse cx="40" cy="10" rx="12" ry="10" fill={c} />
      <ellipse cx="40" cy="8"  rx="7"  ry="5"  fill={c} />
    </>
  ),
  // 5 = side part / flow
  (c) => (
    <>
      <path d="M15 42 Q14 14 40 11 Q65 14 66 42 Q60 18 40 17 Q20 18 15 42Z" fill={c} />
      <path d="M15 42 Q13 58 15 70 Q18 60 20 50" fill={c} />
    </>
  ),
];

// ── Eyes ─────────────────────────────────────────────────────────────────────
const EYES = [
  // 0 = simple dots
  <>
    <circle cx="32" cy="40" r="3.5" fill="#1a1a1a" />
    <circle cx="48" cy="40" r="3.5" fill="#1a1a1a" />
    <circle cx="33.2" cy="38.8" r="1.1" fill="white" />
    <circle cx="49.2" cy="38.8" r="1.1" fill="white" />
  </>,
  // 1 = round eyes with whites
  <>
    <ellipse cx="32" cy="40" rx="5.5" ry="6" fill="white" />
    <ellipse cx="48" cy="40" rx="5.5" ry="6" fill="white" />
    <circle  cx="32" cy="41" r="3.5"  fill="#1a1a1a" />
    <circle  cx="48" cy="41" r="3.5"  fill="#1a1a1a" />
    <circle  cx="33.2" cy="39.5" r="1.3" fill="white" />
    <circle  cx="49.2" cy="39.5" r="1.3" fill="white" />
    {/* Eyelashes / brow suggestion */}
    <path d="M27 35 Q32 33 37 35" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M43 35 Q48 33 53 35" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>,
  // 2 = happy squint (curved closed eyes)
  <>
    <path d="M27 40 Q32 35 37 40" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M43 40 Q48 35 53 40" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M27 40 Q32 44 37 40" stroke="#1a1a1a" strokeWidth="1.2" fill="rgba(0,0,0,0.08)" strokeLinecap="round" />
    <path d="M43 40 Q48 44 53 40" stroke="#1a1a1a" strokeWidth="1.2" fill="rgba(0,0,0,0.08)" strokeLinecap="round" />
  </>,
];

// ── Mouth ────────────────────────────────────────────────────────────────────
const MOUTHS = [
  // 0 = warm smile
  <path d="M32 54 Q40 62 48 54" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  // 1 = open grin (with teeth)
  <>
    <path d="M31 52 Q40 62 49 52" stroke="#1a1a1a" strokeWidth="2.2" fill="#ff6b6b" strokeLinecap="round" />
    <path d="M33 52 Q40 60 47 52" fill="white" />
    <line x1="40" y1="52" x2="40" y2="60" stroke="#e55" strokeWidth="1" />
  </>,
  // 2 = neutral / slight smile
  <path d="M33 54 Q40 57 47 54" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />,
];

// ── Headwear ─────────────────────────────────────────────────────────────────
const HEADWEAR = [
  null, // 0 = none
  // 1 = cap
  (c) => (
    <>
      <path d="M16 42 Q16 18 40 15 Q64 18 64 42 Z" fill={c} />
      <path d="M13 43 Q40 38 67 43 Q67 40 40 37 Q13 40 13 43 Z" fill={c} />
      <rect x="16" y="42" width="48" height="5" rx="2" fill={c} opacity="0.6" />
    </>
  ),
  // 2 = beanie
  (c) => (
    <>
      <path d="M17 44 Q16 18 40 15 Q64 18 63 44 Z" fill={c} />
      <rect x="15" y="41" width="50" height="8" rx="4" fill={c} />
      <ellipse cx="40" cy="13" rx="6" ry="5" fill={c} />
    </>
  ),
  // 3 = halo
  (_c) => (
    <ellipse cx="40" cy="10" rx="18" ry="5" stroke="#FFC800" strokeWidth="3.5" fill="none" opacity="0.9" />
  ),
];

// ── Face details ─────────────────────────────────────────────────────────────
const FACE_DETAILS = [
  null,
  // 1 = freckles
  <>
    <circle cx="35" cy="49" r="1.4" fill="#c8855a" opacity="0.65" />
    <circle cx="37.5" cy="51.5" r="1.1" fill="#c8855a" opacity="0.65" />
    <circle cx="32.5" cy="51.5" r="1.1" fill="#c8855a" opacity="0.65" />
    <circle cx="45" cy="49" r="1.4" fill="#c8855a" opacity="0.65" />
    <circle cx="42.5" cy="51.5" r="1.1" fill="#c8855a" opacity="0.65" />
    <circle cx="47.5" cy="51.5" r="1.1" fill="#c8855a" opacity="0.65" />
  </>,
  // 2 = blush
  <>
    <ellipse cx="27" cy="49" rx="7" ry="4" fill="#ff8888" opacity="0.32" />
    <ellipse cx="53" cy="49" rx="7" ry="4" fill="#ff8888" opacity="0.32" />
  </>,
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AvatarSVG({ config = {}, size = 40 }) {
  const {
    skinTone  = '#E18E70',
    hairStyle = 1,
    hairColor = '#3C2A1E',
    eyeStyle  = 0,
    mouthStyle= 0,
    shirtColor= '#58CC02',
    bgColor   = '#DDF4FF',
    headwear  = 0,
    faceDetail= 0,
  } = config;

  const hairFn     = HAIR[hairStyle]     ?? HAIR[1];
  const headwearFn = HEADWEAR[headwear]  ?? null;
  // Unique clip-path id per config to avoid SVG collision
  const uid = `av-${size}-${(skinTone + hairStyle).replace(/[^a-z0-9]/gi, '')}`;

  // Slightly darkened skin tone for ear inner / neck shadow
  const earInner = skinTone + 'cc';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={uid}>
          <circle cx="40" cy="40" r="40" />
        </clipPath>
      </defs>

      {/* ── Background ── */}
      <circle cx="40" cy="40" r="40" fill={bgColor} />

      <g clipPath={`url(#${uid})`}>
        {/* ── Shirt / body ── */}
        <path
          d="M 0 90 Q 6 66 22 60 Q 30 65 40 65 Q 50 65 58 60 Q 74 66 80 90 Z"
          fill={shirtColor}
        />
        {/* Shirt collar shadow */}
        <path
          d="M 30 64 Q 40 70 50 64 Q 50 68 40 70 Q 30 68 30 64 Z"
          fill={shirtColor} opacity="0.7"
        />

        {/* ── Neck ── */}
        <rect x="35" y="60" width="10" height="9" rx="4" fill={skinTone} />

        {/* ── Ears ── */}
        <ellipse cx="18" cy="44" rx="5"   ry="6"   fill={skinTone} />
        <ellipse cx="18" cy="44" rx="3"   ry="3.8" fill={earInner} />
        <ellipse cx="62" cy="44" rx="5"   ry="6"   fill={skinTone} />
        <ellipse cx="62" cy="44" rx="3"   ry="3.8" fill={earInner} />

        {/* ── Head ── */}
        <ellipse cx="40" cy="42" rx="23" ry="25" fill={skinTone} />

        {/* ── Hair (back layer, behind head) ── */}
        {hairFn ? hairFn(hairColor) : null}

        {/* ── Face details (freckles / blush) ── */}
        {FACE_DETAILS[faceDetail] ?? null}

        {/* ── Eyes ── */}
        {EYES[eyeStyle] ?? EYES[0]}

        {/* ── Nose (subtle) ── */}
        <path
          d="M 38.5 48 Q 40 50.5 41.5 48"
          stroke={skinTone === '#FFE2D6' ? '#d4a090' : '#b0705a'}
          strokeWidth="1.3" fill="none" strokeLinecap="round"
        />

        {/* ── Mouth ── */}
        {MOUTHS[mouthStyle] ?? MOUTHS[0]}

        {/* ── Headwear (front layer) ── */}
        {headwearFn ? headwearFn(hairColor) : null}
      </g>
    </svg>
  );
}
