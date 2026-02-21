import os
import random
import math

out_dir = "/home/easten/github/secondhand-marketplace/frontend/public/demo-assets/real"
os.makedirs(out_dir, exist_ok=True)

# Category-specific realistic product SVG templates
category_svgs = {
    'electronics': [
        # Phone
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="260" y="60" width="280" height="540" rx="30" ry="30" fill="#2d2d2d" stroke="#555" stroke-width="3"/>
          <rect x="275" y="100" width="250" height="420" rx="5" fill="#4a9eff" opacity="0.8"/>
          <rect x="340" y="75" width="120" height="12" rx="6" fill="#444"/>
          <circle cx="400" cy="640" r="20" fill="#444" stroke="#666" stroke-width="2"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">iPhone 15 Pro Max</text>
        </svg>""",
        # Laptop
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0f3460"/><stop offset="100%" style="stop-color:#1a1a2e"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="100" y="180" width="600" height="380" rx="10" fill="#c0c0c0" stroke="#999" stroke-width="2"/>
          <rect x="120" y="200" width="560" height="320" rx="5" fill="#1a1a2e"/>
          <rect x="60" y="560" width="680" height="30" rx="5" fill="#b0b0b0"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">MacBook Air M2</text>
        </svg>""",
        # Headphones
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1c1c1c"/><stop offset="100%" style="stop-color:#2d2d2d"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <path d="M250,400 Q250,200 400,200 Q550,200 550,400" fill="none" stroke="#444" stroke-width="20"/>
          <rect x="200" y="380" width="80" height="120" rx="40" fill="#333" stroke="#555" stroke-width="3"/>
          <rect x="520" y="380" width="80" height="120" rx="40" fill="#333" stroke="#555" stroke-width="3"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">Sony WH-1000XM5</text>
        </svg>""",
        # Drone
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0d0d0d"/><stop offset="100%" style="stop-color:#1a1a2e"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="300" y="340" width="200" height="80" rx="10" fill="#2d2d2d" stroke="#444"/>
          <ellipse cx="220" cy="320" rx="60" ry="15" fill="none" stroke="#666" stroke-width="3"/>
          <ellipse cx="580" cy="320" rx="60" ry="15" fill="none" stroke="#666" stroke-width="3"/>
          <ellipse cx="220" cy="480" rx="60" ry="15" fill="none" stroke="#666" stroke-width="3"/>
          <ellipse cx="580" cy="480" rx="60" ry="15" fill="none" stroke="#666" stroke-width="3"/>
          <line x1="220" y1="330" x2="300" y2="370" stroke="#444" stroke-width="6"/>
          <line x1="580" y1="330" x2="500" y2="370" stroke="#444" stroke-width="6"/>
          <line x1="220" y1="470" x2="300" y2="420" stroke="#444" stroke-width="6"/>
          <line x1="580" y1="470" x2="500" y2="420" stroke="#444" stroke-width="6"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">DJI Mini 3 Pro</text>
        </svg>""",
        # Watch
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#0d0d0d"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="310" y="160" width="180" height="220" rx="40" fill="#2d2d2d" stroke="#555"/>
          <rect x="325" y="180" width="150" height="180" rx="5" fill="#1a6ed8"/>
          <rect x="350" y="100" width="100" height="80" rx="5" fill="#333"/>
          <rect x="350" y="380" width="100" height="80" rx="5" fill="#333"/>
          <text x="400" y="580" font-family="Arial" font-size="24" fill="#888" text-anchor="middle">10:09</text>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">Apple Watch S9</text>
        </svg>""",
        # Mouse
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1c1c1c"/><stop offset="100%" style="stop-color:#2d2d2d"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <ellipse cx="400" cy="380" rx="130" ry="200" fill="#2d2d2d" stroke="#555" stroke-width="3"/>
          <line x1="400" y1="200" x2="400" y2="450" stroke="#555" stroke-width="3"/>
          <circle cx="430" cy="330" r="15" fill="#1a6ed8"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">Logitech MX Master</text>
        </svg>""",
        # E-reader
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a1a"/><stop offset="100%" style="stop-color:#2d2d2d"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="250" y="120" width="300" height="420" rx="20" fill="#f5f5e8" stroke="#999" stroke-width="3"/>
          <rect x="265" y="140" width="270" height="360" fill="#e8e8d0"/>
          <line x1="280" y1="200" x2="520" y2="200" stroke="#ccc" stroke-width="2"/>
          <line x1="280" y1="230" x2="520" y2="230" stroke="#ccc" stroke-width="2"/>
          <line x1="280" y1="260" x2="480" y2="260" stroke="#ccc" stroke-width="2"/>
          <line x1="280" y1="290" x2="520" y2="290" stroke="#ccc" stroke-width="2"/>
          <line x1="280" y1="320" x2="500" y2="320" stroke="#ccc" stroke-width="2"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">Kindle Paperwhite 5</text>
        </svg>""",
        # Game controller
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0a0a1a"/><stop offset="100%" style="stop-color:#1a1a2e"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <path d="M200,380 Q200,260 300,260 L500,260 Q600,260 600,380 Q600,520 500,540 L300,540 Q200,520 200,380 Z" fill="#2d2d2d" stroke="#555"/>
          <rect x="280" y="310" width="80" height="15" rx="5" fill="#555"/>
          <rect x="313" y="280" width="15" height="80" rx="5" fill="#555"/>
          <circle cx="490" cy="310" r="15" fill="#e74c3c"/>
          <circle cx="530" cy="330" r="15" fill="#2ecc71"/>
          <circle cx="470" cy="340" r="15" fill="#3498db"/>
          <circle cx="510" cy="355" r="15" fill="#f39c12"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">Switch OLED</text>
        </svg>""",
    ],
    'books': [
        # Stack of books
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f5f0e8"/><stop offset="100%" style="stop-color:#e8ddc8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="220" y="180" width="40" height="360" rx="5" fill="#e74c3c"/>
          <rect x="260" y="200" width="40" height="340" rx="5" fill="#3498db"/>
          <rect x="300" y="160" width="40" height="380" rx="5" fill="#2ecc71"/>
          <rect x="340" y="190" width="40" height="350" rx="5" fill="#f39c12"/>
          <rect x="380" y="170" width="40" height="370" rx="5" fill="#9b59b6"/>
          <rect x="420" y="200" width="40" height="340" rx="5" fill="#1abc9c"/>
          <rect x="460" y="180" width="40" height="360" rx="5" fill="#e67e22"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">考研教材全套</text>
        </svg>""",
        # Single open book
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#faf8f0"/><stop offset="100%" style="stop-color:#f0ead8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <path d="M200,220 Q400,180 400,300 L400,560 Q400,580 380,580 L200,560 Z" fill="#e8e0d0" stroke="#ccc"/>
          <path d="M600,220 Q400,180 400,300 L400,560 Q400,580 420,580 L600,560 Z" fill="#e8e0d0" stroke="#ccc"/>
          <line x1="230" y1="320" x2="390" y2="310" stroke="#ccc" stroke-width="2"/>
          <line x1="230" y1="355" x2="390" y2="345" stroke="#ccc" stroke-width="2"/>
          <line x1="230" y1="390" x2="390" y2="380" stroke="#ccc" stroke-width="2"/>
          <line x1="410" y1="310" x2="570" y2="320" stroke="#ccc" stroke-width="2"/>
          <line x1="410" y1="345" x2="570" y2="355" stroke="#ccc" stroke-width="2"/>
          <line x1="410" y1="380" x2="570" y2="390" stroke="#ccc" stroke-width="2"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">三体精装版</text>
        </svg>""",
    ],
    'furniture': [
        # Desk
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f5f0e8"/><stop offset="100%" style="stop-color:#e8ddc8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="100" y="320" width="600" height="50" rx="5" fill="#8B6914" stroke="#6B4F10"/>
          <rect x="120" y="370" width="30" height="200" fill="#8B6914"/>
          <rect x="650" y="370" width="30" height="200" fill="#8B6914"/>
          <rect x="330" y="370" width="30" height="200" fill="#8B6914"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">宜家实木书桌</text>
        </svg>""",
        # Ergonomic chair
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f0f0"/><stop offset="100%" style="stop-color:#e0e0e0"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="280" y="200" width="240" height="280" rx="20" fill="#2d2d2d"/>
          <rect x="250" y="460" width="300" height="40" rx="5" fill="#333"/>
          <rect x="380" y="500" width="40" height="100" fill="#333"/>
          <ellipse cx="400" cy="620" rx="140" ry="30" fill="#555" stroke="#444"/>
          <line x1="300" y1="610" x2="250" y2="680" stroke="#444" stroke-width="10"/>
          <line x1="370" y1="615" x2="340" y2="690" stroke="#444" stroke-width="10"/>
          <line x1="430" y1="615" x2="460" y2="690" stroke="#444" stroke-width="10"/>
          <line x1="500" y1="610" x2="550" y2="680" stroke="#444" stroke-width="10"/>
          <text x="400" y="760" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">人体工学椅</text>
        </svg>""",
    ],
    'clothing': [
        # Sneakers
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f0f0"/><stop offset="100%" style="stop-color:#e0e0e8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <path d="M150,480 Q200,360 350,340 L580,340 Q640,340 660,380 L680,420 Q700,460 650,480 Z" fill="white" stroke="#ccc" stroke-width="3"/>
          <path d="M150,480 Q200,480 400,470 L680,460 L680,500 Q600,530 400,530 Q200,540 150,500 Z" fill="#e0e0e0" stroke="#ccc"/>
          <path d="M350,340 L370,290 Q400,270 440,280 L460,340" fill="#f0f0f0" stroke="#ccc"/>
          <text x="400" y="720" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">Nike Air Force 1</text>
        </svg>""",
        # Jacket
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#e8eaf0"/><stop offset="100%" style="stop-color:#d8dce8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <path d="M250,180 L180,250 L150,350 L180,560 L280,560 L280,350 L400,380 L520,350 L520,560 L620,560 L650,350 L620,250 L550,180 L480,220 L400,240 L320,220 Z" fill="#2c3e50" stroke="#1a252f" stroke-width="3"/>
          <path d="M250,180 L320,220 L400,240 L480,220 L550,180" fill="none" stroke="#34495e" stroke-width="3"/>
          <line x1="400" y1="240" x2="400" y2="560" stroke="#34495e" stroke-width="3"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">The North Face 冲锋衣</text>
        </svg>""",
    ],
    'beauty': [
        # Serum bottle
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fff8f0"/><stop offset="100%" style="stop-color:#f8e8d0"/></linearGradient>
          <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#c8a060"/><stop offset="50%" style="stop-color:#e8c080"/><stop offset="100%" style="stop-color:#c8a060"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="330" y="180" width="140" height="420" rx="30" fill="url(#bottle)" stroke="#b08040"/>
          <rect x="350" y="155" width="100" height="40" rx="15" fill="#c8a060" stroke="#b08040"/>
          <rect x="360" y="135" width="80" height="30" rx="5" fill="#888"/>
          <text x="400" y="320" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle" font-weight="bold">LA MER</text>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">雅诗兰黛精华</text>
        </svg>""",
        # Perfume
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f8f0ff"/><stop offset="100%" style="stop-color:#e8d8f8"/></linearGradient>
          <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d4b8f0"/><stop offset="100%" style="stop-color:#a080d0"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="290" y="220" width="220" height="320" rx="20" fill="url(#bottle)" stroke="#9060c0"/>
          <rect x="340" y="180" width="120" height="50" rx="10" fill="#b090e0" stroke="#9060c0"/>
          <rect x="370" y="150" width="60" height="40" rx="5" fill="#888"/>
          <text x="400" y="380" font-family="Arial" font-size="20" fill="#fff" text-anchor="middle" font-weight="bold">Jo Malone</text>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">祖玛珑蓝风铃</text>
        </svg>""",
    ],
    'appliance': [
        # Robot vacuum
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f0f0"/><stop offset="100%" style="stop-color:#e0e0e0"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <ellipse cx="400" cy="430" rx="220" ry="60" fill="#333" stroke="#555" stroke-width="3"/>
          <ellipse cx="400" cy="400" rx="220" ry="90" fill="#2d2d2d" stroke="#555" stroke-width="3"/>
          <circle cx="400" cy="380" r="60" fill="#3d3d3d" stroke="#555"/>
          <circle cx="400" cy="380" r="20" fill="#1a6ed8"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">米家扫地机器人</text>
        </svg>""",
        # Dyson vacuum
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f8ff"/><stop offset="100%" style="stop-color:#e0e8f8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="370" y="130" width="60" height="300" rx="10" fill="#c0392b" stroke="#a02820"/>
          <ellipse cx="400" cy="440" rx="120" ry="40" fill="#c0392b" stroke="#a02820"/>
          <ellipse cx="400" cy="420" rx="120" ry="130" fill="none" stroke="#c0392b" stroke-width="15"/>
          <circle cx="400" cy="420" rx="50" r="50" fill="#2d2d2d"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">戴森 V10 吸尘器</text>
        </svg>""",
    ],
    'sports': [
        # Dumbbells
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f0f0"/><stop offset="100%" style="stop-color:#e0e0e0"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="100" y="360" width="120" height="80" rx="10" fill="#444" stroke="#333"/>
          <rect x="220" y="380" width="360" height="40" rx="5" fill="#666" stroke="#555"/>
          <rect x="580" y="360" width="120" height="80" rx="10" fill="#444" stroke="#333"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">哑铃套装 15KG</text>
        </svg>""",
        # Bicycle
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f0f0f0"/><stop offset="100%" style="stop-color:#e8eef8"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <circle cx="250" cy="460" r="130" fill="none" stroke="#2c3e50" stroke-width="12"/>
          <circle cx="550" cy="460" r="130" fill="none" stroke="#2c3e50" stroke-width="12"/>
          <circle cx="250" cy="460" r="15" fill="#2c3e50"/>
          <circle cx="550" cy="460" r="15" fill="#2c3e50"/>
          <line x1="250" y1="460" x2="400" y2="320" stroke="#e74c3c" stroke-width="10"/>
          <line x1="400" y1="320" x2="550" y2="460" stroke="#e74c3c" stroke-width="10"/>
          <line x1="400" y1="320" x2="400" y2="460" stroke="#e74c3c" stroke-width="10"/>
          <line x1="250" y1="460" x2="400" y2="460" stroke="#e74c3c" stroke-width="10"/>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#555" text-anchor="middle">公路自行车</text>
        </svg>""",
    ],
    'others': [
        # Ticket
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#0f3460"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="100" y="280" width="600" height="240" rx="20" fill="#e74c3c" stroke="#c0392b"/>
          <circle cx="100" cy="400" r="30" fill="#1a1a2e"/>
          <circle cx="700" cy="400" r="30" fill="#1a1a2e"/>
          <line x1="300" y1="280" x2="300" y2="520" stroke="#c0392b" stroke-width="3" stroke-dasharray="10"/>
          <text x="480" y="400" font-family="Arial" font-size="40" fill="white" text-anchor="middle" font-weight="bold">演唱会</text>
          <text x="480" y="450" font-family="Arial" font-size="22" fill="#ffeeee" text-anchor="middle">★ ★ ★ ★ ★</text>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">演唱会门票</text>
        </svg>""",
        # Gift card
        """<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#006241"/><stop offset="100%" style="stop-color:#004d33"/></linearGradient></defs>
          <rect width="800" height="800" fill="url(#bg)"/>
          <rect x="120" y="260" width="560" height="280" rx="25" fill="#00704a" stroke="#005538"/>
          <path d="M350,250 Q370,200 400,180 Q430,200 450,250" fill="none" stroke="#d4aa70" stroke-width="8"/>
          <circle cx="400" cy="180" r="20" fill="#d4aa70"/>
          <text x="400" y="380" font-family="Georgia" font-size="38" fill="white" text-anchor="middle">Starbucks</text>
          <text x="400" y="430" font-family="Arial" font-size="24" fill="#d4aa70" text-anchor="middle">GIFT CARD ¥500</text>
          <text x="400" y="740" font-family="Arial" font-size="28" fill="#aaa" text-anchor="middle">星巴克礼品卡</text>
        </svg>""",
    ],
}

# Map product titles to categories for realistic assignment
title_to_category = {
    "iPhone 15 Pro Max 256G": "electronics",
    "MacBook Air M2 16G 512G": "electronics",
    "索尼 WH-1000XM5 降噪耳机": "electronics",
    "大疆 DJI Mini 3 Pro 无人机": "electronics",
    "Switch OLED 日版续航增强板": "electronics",
    "罗技 MX Master 3S 无线鼠标": "electronics",
    "Kindle Paperwhite 5 签名版": "electronics",
    "Apple Watch Series 9 45mm": "electronics",
    "考研数学复习全书+习题": "books",
    "《深入理解计算机系统》CSAPP": "books",
    "三体全集（刘慈欣）精装版": "books",
    "新概念英语 1-4册全套": "books",
    "毛泽东选集 第一卷至第四卷": "books",
    "人类简史+未来简史套装": "books",
    "宜家实木书桌 120x60cm": "furniture",
    "人体工学椅 电竞版": "furniture",
    "单人折叠沙发床": "furniture",
    "简易四层衣柜/置物架": "furniture",
    "北欧风圆形落地灯": "furniture",
    "Nike AF1 空军一号 纯白 42码": "clothing",
    "The North Face 1996 冲锋衣": "clothing",
    "优衣库 U系列 纯棉 T恤 M码": "clothing",
    "始祖鸟 Arc''teryx 抓绒外套": "clothing",
    "Zara 休闲西装外套 S码": "clothing",
    "雅诗兰黛 小棕瓶精华 50ml": "beauty",
    "SK-II 神仙水 230ml": "beauty",
    "迪奥 999 哑光口红": "beauty",
    "海蓝之谜 面霜 30ml 全新": "beauty",
    "祖玛珑 蓝风铃香水 100ml": "beauty",
    "米家 小米扫地机器人 Pro": "appliance",
    "戴森 V10 吸尘器": "appliance",
    "九阳 破壁机/榨汁机": "appliance",
    "美的 20L 迷你微波炉": "appliance",
    "飞利浦 电流恒温吹风机": "appliance",
    "迪卡侬 哑铃套装 15KG": "sports",
    "李宁 尤尼克斯 羽毛球拍": "sports",
    "公路自行车 铝合金车架": "sports",
    "瑜伽垫 + 泡沫轴 套装": "sports",
    "周杰伦 演唱会门票 随机出": "others",
    "星巴克 星礼卡 500面值": "others",
    "猫架/猫爬架 三层原木": "others",
    "哈利波特 盲盒 隐藏款": "others",
}

# Write category-aware SVGs
count = 0
for category, svgs in category_svgs.items():
    for idx, svg in enumerate(svgs):
        fname = f"{category}_{idx+1:02d}.svg"
        with open(os.path.join(out_dir, fname), 'w', encoding='utf-8') as f:
            f.write(svg)
        count += 1

# Generate additional generic per-category images to fill up to 80+
for i in range(count + 1, 100):
    cats = list(category_svgs.keys())
    cat = cats[i % len(cats)]
    colors = {
        'electronics': ('#1a1a2e', '#4a9eff'),
        'books': ('#f5f0e8', '#2c3e50'),
        'furniture': ('#f0ead8', '#8B5E3C'),
        'clothing': ('#f8f0f8', '#6c3483'),
        'beauty': ('#fff0f8', '#e91e8c'),
        'appliance': ('#f0f0f5', '#2980b9'),
        'sports': ('#f0f5f0', '#27ae60'),
        'others': ('#fdf6e3', '#e67e22'),
    }
    bg, accent = colors[cat]
    svg = f"""<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g{i}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:{bg}"/><stop offset="100%" style="stop-color:{accent}20"/>
      </linearGradient></defs>
      <rect width="800" height="800" fill="url(#g{i})"/>
      <text x="400" y="380" font-family="Arial" font-size="48" fill="{accent}" text-anchor="middle" font-weight="bold">{cat.upper()}</text>
      <text x="400" y="450" font-family="Arial" font-size="28" fill="{accent}aa" text-anchor="middle">优品二手</text>
    </svg>"""
    with open(os.path.join(out_dir, f"{cat}_{i:03d}.svg"), 'w') as f:
        f.write(svg)
    count += 1

print(f"Generated {count} realistic product SVG images in {out_dir}")
print(f"Images by category:")
for cat in category_svgs:
    cat_count = len([f for f in os.listdir(out_dir) if f.startswith(cat)])
    print(f"  {cat}: {cat_count}")
