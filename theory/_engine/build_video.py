#!/usr/bin/env python3
"""Build a module video: python3 theory/_engine/build_video.py <scenes.js> <out.html> "<title>" "<LABEL>"
The engine (canvas helpers, timeline, audio, voice-over, UI) lives in prefix.html / suffix.html; a module only supplies its scenes."""
import sys, re, subprocess, tempfile, pathlib
here = pathlib.Path(__file__).parent
scenes, out, title, label = sys.argv[1:5]
html = (here/"prefix.html").read_text().replace("__TITLE__", title) + pathlib.Path(scenes).read_text() + (here/"suffix.html").read_text().replace("__LABEL__", label)
pathlib.Path(out).write_text(html)
js = re.search(r"<script>(.*)</script>", html, re.S).group(1)
f = tempfile.NamedTemporaryFile("w", suffix=".js", delete=False); f.write(js); f.close()
r = subprocess.run(["node", "--check", f.name], capture_output=True, text=True)
print("built", out, "- syntax ok" if r.returncode == 0 else r.stderr[:1200])
