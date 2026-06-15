import { useState } from 'react'

const plans = [
  {
    tier: 'Explorer',
    priceMonthly: 'Free',
    priceYearly: 'Free',
    desc: 'For casual travelers just starting their journey.',
    features: [
      'Up to 3 trips',
      '50 memories per trip',
      'Interactive world map',
      'Basic photo journals',
      'Access via web and mobile',
    ],
    pro: false,
  },
  {
    tier: 'Wanderer',
    priceMonthly: '$9,99/m',
    priceYearly: '$99,99/y',
    desc: 'For frequent travelers building a lifetime of memories.',
    features: [
      'Unlimited trips',
      'Unlimited memories',
      'Custom memory journals',
      'Share unlimited collections',
      'Priority photo import',
    ],
    pro: false,
  },
  {
    tier: 'Nomad',
    priceMonthly: '$19,99/m',
    priceYearly: '$199,99/y',
    desc: 'For globe-trotters, bloggers, and adventure creators.',
    features: [
      'Everything in Wanderer',
      'AI-powered travel writing',
      'Custom map styles & themes',
      'Family & friend sharing',
      'Offline access anywhere',
    ],
    pro: true,
  },
]

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section className="c3-pricing-section relative z-10">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="c3-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={2} stitchTiles="stitch" />
            <feComponentTransfer>
              <feFuncA type="linear" slope={0.075} />
            </feComponentTransfer>
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      {/* Watermark */}
      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Your world.</span>
          <span className="c3-watermark-line-2">Remembered</span>
        </div>
      </div>

      {/* Cards */}
      <div className="c3-grid">
        {plans.map(({ tier, priceMonthly, priceYearly, desc, features, pro }) => (
          <div key={tier} className={`c3-card${pro ? ' c3-card-pro' : ''}`}>
            <div className="c3-tier-small">{tier}</div>
            <div className="c3-tier-large">{yearly ? priceYearly : priceMonthly}</div>
            <div className="c3-desc">{desc}</div>
            <ul className="c3-list">
              {features.map((f) => (
                <li key={f}>
                  <span className="c3-check"><CheckIcon /></span>
                  {f}
                </li>
              ))}
            </ul>
            <button className="c3-btn">Choose Plan</button>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="c3-toggle-wrap">
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Yearly</span>
        <button
          className={`c3-toggle${yearly ? ' active' : ''}`}
          onClick={() => setYearly((v) => !v)}
          aria-label="Toggle yearly pricing"
        >
          <span className="c3-toggle-knob" />
        </button>
      </div>
    </section>
  )
}
