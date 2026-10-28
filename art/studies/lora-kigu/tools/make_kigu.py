"""Queue one Kigu sprite in the running ComfyUI and wait for the PNG.

Usage: python make_kigu.py "teal otter onesie with round-ear hood, ..." [--seed 123] [--ref sprite.png --denoise 0.6] [--snap]
The trigger phrase and the house style (Kigu Quest look) are added automatically; pass --raw-prompt to skip them.
--ref starts from an existing sprite (img2img) so pose and proportions follow it; lower --denoise keeps more of it.
--snap also writes <name>-px.png: 8px grid (128px sprite at x8), 32 colours, like the AutoSprite Kigu.
"""
import argparse, json, pathlib, random, time, urllib.parse, urllib.request, uuid

SERVER = "http://127.0.0.1:8188"
HERE = pathlib.Path(__file__).parent
OUTPUT_DIR = HERE / "out"

# Our Kigu: a girl wearing an animal onesie, chibi but not baby-like, full body, BW-era DS sprite look
HOUSE_STYLE = ("Pixel art style. Chunky low-resolution pixel art game sprite in the style of a Nintendo DS monster-collecting RPG, "
               "about 128 pixels tall, clean 1-pixel dark outline, cel shading with 3 tones per colour, light from the top left, "
               "limited saturated palette. A cute girl about 3 heads tall with warm peach skin and rosy cheeks, wearing {desc}. "
               "The onesie covers her whole body from hood to ankles, zipped up, with mitten hands and boot feet. "
               "Full body, front view, standing straight, happy small smile, small simple eyes. "
               "Plain white background with no border, no frame and no card, wide empty margin on every side, nothing touches the edges.")

ap = argparse.ArgumentParser()
ap.add_argument("prompt")
ap.add_argument("--seed", type=int, default=None)
ap.add_argument("--size", type=int, default=768, help="768 = the size the Kigu LoRA was trained at")
ap.add_argument("--prefix", default="kigu/sprite")
ap.add_argument("--ref", help="start from this image instead of noise")
ap.add_argument("--denoise", type=float, default=0.65)
ap.add_argument("--lora", type=float, default=1.0, help="LoRA strength")
ap.add_argument("--lora-file", default="kigustyle_zimage_v2.safetensors",
                help="kigustyle_zimage_v2 = trained on our Kigu with captions written from the sprites; "
                     "v1 = captions from the BIBLE; pixel_art_style_z_image_turbo = the generic one")
ap.add_argument("--view", default="front view, standing", help='e.g. "dynamic action pose" or "seen from behind, back view"')
ap.add_argument("--snap", action="store_true")
ap.add_argument("--raw-prompt", action="store_true")
args = ap.parse_args()

def post(path, data, ctype):
    return json.load(urllib.request.urlopen(urllib.request.Request(f"{SERVER}{path}", data, {"Content-Type": ctype})))

wf = json.loads((HERE / "kigu_zimage_pixel_api.json").read_text())
wf["4"]["inputs"]["strength_model"] = args.lora
wf["4"]["inputs"]["lora_name"] = args.lora_file
if args.raw_prompt:
    wf["6"]["inputs"]["text"] = args.prompt
elif args.lora_file.startswith("kigustyle"):
    # same wording as the training captions (K:\ComfyUI\training\looks.txt), so the trained look switches on
    wf["6"]["inputs"]["text"] = f"kigustyle pixel art game sprite, {args.prompt}. {args.view}, full body, plain white background"
else:
    wf["6"]["inputs"]["text"] = HOUSE_STYLE.format(desc=args.prompt)
wf["8"]["inputs"]["width"] = wf["8"]["inputs"]["height"] = args.size
wf["9"]["inputs"]["seed"] = args.seed if args.seed is not None else random.randrange(2**32)
wf["11"]["inputs"]["filename_prefix"] = args.prefix

if args.ref:
    # upload the reference, flatten any transparency onto white, encode it and denoise only part of the way
    ref = pathlib.Path(args.ref)
    boundary = uuid.uuid4().hex
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{ref.name}\"\r\n"
            f"Content-Type: image/png\r\n\r\n").encode() + ref.read_bytes() + \
           f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"overwrite\"\r\n\r\ntrue\r\n--{boundary}--\r\n".encode()
    name = post("/upload/image", body, f"multipart/form-data; boundary={boundary}")["name"]
    wf["20"] = {"class_type": "LoadImage", "inputs": {"image": name}}
    wf["21"] = {"class_type": "ImageScale", "inputs": {"image": ["20", 0], "upscale_method": "nearest-exact",
                                                       "width": args.size, "height": args.size, "crop": "center"}}
    wf["22"] = {"class_type": "VAEEncode", "inputs": {"pixels": ["21", 0], "vae": ["3", 0]}}
    wf["9"]["inputs"]["latent_image"] = ["22", 0]
    wf["9"]["inputs"]["denoise"] = args.denoise

pid = post("/prompt", json.dumps({"prompt": wf}).encode(), "application/json")["prompt_id"]
print("queued", pid, "seed", wf["9"]["inputs"]["seed"])

while True:
    hist = json.load(urllib.request.urlopen(f"{SERVER}/history/{pid}"))
    if pid in hist:
        entry = hist[pid]
        if entry.get("status", {}).get("status_str") == "error":
            raise SystemExit(json.dumps(entry["status"], indent=1))
        for out in entry["outputs"].values():
            for img in out.get("images", []):
                # ComfyUI's output folder isn't where the install suggests, so pull the PNG over HTTP
                query = urllib.parse.urlencode(img)
                dest = OUTPUT_DIR / img["filename"]
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(urllib.request.urlopen(f"{SERVER}/view?{query}").read())
                print(dest)
                if args.snap:
                    from snap import snap
                    print(snap(dest, grid=args.size // 128, colours=32))
        break
    time.sleep(1)
