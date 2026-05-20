import os
import argparse
import imageio
from PIL import Image

def main():
    parser = argparse.ArgumentParser(
        description="Convert video files (MP4, etc.) into web-optimized GIFs for the portfolio website."
    )
    parser.add_argument(
        "-i", "--input", 
        required=True, 
        help="Path to the input video file (e.g. mp4)"
    )
    parser.add_argument(
        "-o", "--output", 
        help="Path to the output GIF file. Defaults to input path with .gif extension"
    )
    parser.add_argument(
        "-f", "--fps", 
        type=int, 
        default=12, 
        help="Target FPS for the output GIF (default: 12)"
    )
    parser.add_argument(
        "-w", "--width", 
        type=int, 
        default=480, 
        help="Target width in pixels, keeping aspect ratio (default: 480)"
    )
    parser.add_argument(
        "-m", "--max-frames", 
        type=int, 
        default=150, 
        help="Maximum number of frames to convert (default: 150)"
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' does not exist.")
        return

    output_path = args.output
    if not output_path:
        base, _ = os.path.splitext(args.input)
        output_path = base + ".gif"

    print(f"Reading video from: {args.input}")
    try:
        reader = imageio.get_reader(args.input)
        meta = reader.get_meta_data()
        original_fps = meta.get('fps', 30)
        print(f"Original video FPS: {original_fps}")
    except Exception as e:
        print(f"Error reading video file: {e}")
        return

    frame_step = max(1, int(round(original_fps / args.fps)))
    print(f"Sampling every {frame_step} frame(s) to reach target of ~{args.fps} FPS.")

    frames = []
    try:
        for i, frame in enumerate(reader):
            if i % frame_step != 0:
                continue
            
            if len(frames) >= args.max_frames:
                print(f"Reached maximum frame limit of {args.max_frames}.")
                break
                
            img = Image.fromarray(frame)
            w, h = img.size
            target_h = int(h * (args.width / w))
            img_resized = img.resize((args.width, target_h), Image.Resampling.LANCZOS)
            frames.append(img_resized)
    except Exception as e:
        print(f"Error processing video frames: {e}")
        return

    print(f"Loaded and resized {len(frames)} frames. Writing GIF...")

    if frames:
        try:
            frames[0].save(
                output_path,
                save_all=True,
                append_images=frames[1:],
                optimize=True,
                duration=int(1000 / args.fps),
                loop=0
            )
            print(f"Successfully created optimized GIF at: {output_path}")
        except Exception as e:
            print(f"Error saving GIF: {e}")
    else:
        print("Error: No frames were loaded.")

if __name__ == "__main__":
    main()
