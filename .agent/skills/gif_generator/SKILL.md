---
name: gif_generator
description: Converts video files (e.g., MP4) into web-optimized animated GIFs suitable for the portfolio's animated listing card previews.
---
# GIF Generator Skill

Use this skill to convert video clips into optimized animated GIFs.

## Execution
Run the GIF generator script:
```bash
python skills/gif_generator/generate_gif.py -i <input_video> [-o <output_gif>] [-f <target_fps>] [-w <target_width>] [-m <max_frames>]
```

### Parameter Reference:
- `-i` / `--input`: Path to input video file (required)
- `-o` / `--output`: Path to output GIF file (defaults to input path with `.gif` extension)
- `-f` / `--fps`: Target frame rate for the GIF (default: `12`)
- `-w` / `--width`: Target width in pixels, keeping aspect ratio (default: `480`)
- `-m` / `--max-frames`: Cap on total frame count to limit file sizes (default: `150`)
