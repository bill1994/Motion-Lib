# Plan: Deliver itsoffbrand Orb Analysis to Obsidian Vault

## Goal
Write the itsoffbrand water orb technical analysis as a structured, Chinese-language Markdown note into the user's Obsidian vault at `/mnt/g/Obsidian/CGIdea/`.

## Steps

### 1. Create directories
```
mkdir -p "/mnt/g/Obsidian/CGIdea/技术参考/WebGL 效果"
```

### 2. Write the note file
Write to `/mnt/g/Obsidian/CGIdea/技术参考/WebGL 效果/itsoffbrand-水球效果.md` with:

- **YAML frontmatter**: tags (webgl, threejs, shader, water-effect, matcap, noise, vertex-displacement, ref), source URL, date
- **Pipeline diagram**: ASCII/text-based 3-pass pipeline (Noise displacement → Wave simulation → Matcap render)
- **Pass 1** — Simplex noise + dual mouse points with cos-based falloff
- **Pass 2** — Wave equation smoother (Verlet integration, RG channel physics)
- **Pass 3** — Finite-difference normal derivation + dual matcap blend + Lambert + Blinn-Phong
- **Vertex shader** — Normal-direction displacement from heightmap
- **Technical decisions table**: why Simplex noise, why Matcap, why multi-pass RT
- **Reusable patterns**: heightmap→pseudo-normals, matcap PBR substitute, 2D texture physics
- **Source link**

### 3. Verify
- `ls` to confirm file exists
- Verify frontmatter is valid YAML
- Confirm Obsidian can open it (vault config check)

### Files modified (in Obsidian vault, not project repo)
- `/mnt/g/Obsidian/CGIdea/技术参考/WebGL 效果/itsoffbrand-水球效果.md` — **new file**
