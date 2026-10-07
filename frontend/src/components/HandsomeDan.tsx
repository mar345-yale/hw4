/** Handsome Dan, Yale's bulldog mascot, drawn as inline SVG (no image generation).
 *  Modeled on the real Handsome Dan: heavy jowls, a wrinkled brow, a flat pushed-in
 *  nose, an underbite, rose ears, a brown eye patch, and the navy "Y" bandana. */
export default function HandsomeDan({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      role="img"
      aria-label="Handsome Dan, the Yale bulldog mascot, in his navy Y bandana"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft backdrop */}
      <circle cx="150" cy="150" r="146" fill="#eaf2fc" />
      <circle cx="150" cy="150" r="146" fill="none" stroke="#cdddf2" strokeWidth="3" />

      {/* rose ears (dark, folded) behind the head */}
      <path d="M104 72 C82 50 56 58 58 88 C60 108 82 114 100 100 C94 88 98 80 104 72 Z" fill="#3f3027" stroke="#2a2018" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M196 72 C218 50 244 58 242 88 C240 108 218 114 200 100 C206 88 202 80 196 72 Z" fill="#3f3027" stroke="#2a2018" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M92 92 C80 80 70 82 70 94 C72 104 84 104 92 92 Z" fill="#5a463a" />
      <path d="M208 92 C220 80 230 82 230 94 C228 104 216 104 208 92 Z" fill="#5a463a" />

      {/* neck fur behind the bandana */}
      <path d="M100 196 C104 224 130 238 150 238 C170 238 196 224 200 196 L200 246 L100 246 Z" fill="#f2ebdd" />

      {/* broad bulldog head */}
      <path
        d="M150 48 C110 48 80 64 74 104 C70 136 86 172 116 188 C128 195 140 198 150 198 C160 198 172 195 184 188 C214 172 230 136 226 104 C220 64 190 48 150 48 Z"
        fill="#f4eee1"
        stroke="#d8cdb8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* brown patch over the dog's right eye/ear */}
      <path d="M76 106 C74 76 94 56 122 60 C138 72 134 102 118 122 C104 136 80 132 76 106 Z" fill="#c69a68" opacity="0.92" />

      {/* brow + muzzle wrinkles */}
      <path d="M106 98 Q150 80 194 98" fill="none" stroke="#cdbfa6" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 84 Q150 72 180 84" fill="none" stroke="#cdbfa6" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 92 Q139 114 150 134" fill="none" stroke="#cdbfa6" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 92 Q161 114 150 134" fill="none" stroke="#cdbfa6" strokeWidth="3" strokeLinecap="round" />

      {/* eyes (amber, set wide) with droopy lower lids */}
      <ellipse cx="116" cy="122" rx="16" ry="14" fill="#ffffff" stroke="#2a2520" strokeWidth="2.5" />
      <ellipse cx="184" cy="122" rx="16" ry="14" fill="#ffffff" stroke="#2a2520" strokeWidth="2.5" />
      <circle cx="117" cy="123" r="9" fill="#7a5020" />
      <circle cx="183" cy="123" r="9" fill="#7a5020" />
      <circle cx="117" cy="123" r="4.5" fill="#241c15" />
      <circle cx="183" cy="123" r="4.5" fill="#241c15" />
      <circle cx="120" cy="119" r="2.4" fill="#ffffff" />
      <circle cx="186" cy="119" r="2.4" fill="#ffffff" />
      <path d="M100 134 Q116 141 132 134" fill="none" stroke="#cdbfa6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M168 134 Q184 141 200 134" fill="none" stroke="#cdbfa6" strokeWidth="2.5" strokeLinecap="round" />

      {/* navy Y bandana */}
      <path d="M68 212 Q150 226 232 212 L208 258 Q150 278 92 258 Z" fill="#17294d" stroke="#0e1c38" strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 212 Q150 226 232 212" fill="none" stroke="#2c4473" strokeWidth="3" />
      <text x="150" y="252" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fontWeight="700" fill="#ffffff">Y</text>

      {/* heavy drooping jowls */}
      <path
        d="M122 156 C102 168 96 200 118 214 C133 223 145 215 150 205 C155 215 167 223 182 214 C204 200 198 168 178 156 C166 167 150 171 150 171 C150 171 134 167 122 156 Z"
        fill="#f4eee1"
        stroke="#d8cdb8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M126 182 Q133 200 148 204" fill="none" stroke="#dbd0bb" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M174 182 Q167 200 152 204" fill="none" stroke="#dbd0bb" strokeWidth="2.5" strokeLinecap="round" />

      {/* flat pushed-in nose */}
      <path d="M124 138 Q150 130 176 138 Q187 151 174 165 Q150 174 126 165 Q113 151 124 138 Z" fill="#26201b" />
      <ellipse cx="137" cy="153" rx="4" ry="6" fill="#0d0a08" transform="rotate(-18 137 153)" />
      <ellipse cx="163" cy="153" rx="4" ry="6" fill="#0d0a08" transform="rotate(18 163 153)" />
      <ellipse cx="146" cy="142" rx="5" ry="2.5" fill="#4d443b" />
      <path d="M150 174 L150 184" stroke="#2a2520" strokeWidth="2.5" strokeLinecap="round" />

      {/* underbite: dark mouth with little bottom teeth peeking up */}
      <path d="M132 184 Q150 193 168 184 Q165 199 150 201 Q135 199 132 184 Z" fill="#6b2b3a" />
      <path d="M140 190 h7 v-5 a3.5 3.5 0 0 0 -7 0 Z" fill="#ffffff" />
      <path d="M153 190 h7 v-5 a3.5 3.5 0 0 0 -7 0 Z" fill="#ffffff" />
    </svg>
  )
}
