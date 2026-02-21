import os
import random

out_dir = "/home/easten/github/secondhand-marketplace/frontend/public/demo-images"
os.makedirs(out_dir, exist_ok=True)

for i in range(1, 150):
    r, g, b = random.randint(50, 200), random.randint(50, 200), random.randint(50, 200)
    svg_content = f"""<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="rgb({r},{g},{b})"/>
        <text x="50%" y="50%" font-size="60" font-family="sans-serif" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Product {i}</text>
    </svg>"""
    with open(f"{out_dir}/img_{i}.svg", "w") as f:
        f.write(svg_content)

print(f"Generated {i} local SVG images in {out_dir}")
