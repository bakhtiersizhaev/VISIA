# FAL.AI Models Cheat Sheet & API Reference

## 1. Nano Banana (`fal-ai/nano-banana`)

**Type:** Text-to-Image
**Endpoint:** `fal-ai/nano-banana`
**Description:** Fast and cost-effective generation.

### Input Parameters
- **prompt** (string, required): The text prompt.
- **num_images** (integer): Number of images (default: 1).
- **aspect_ratio** (enum): Aspect ratio of the generated image.
  - Values: `21:9`, `16:9`, `3:2`, `4:3`, `5:4`, `1:1`, `4:5`, `3:4`, `2:3`, `9:16`
  - Default: `1:1`
- **output_format** (enum): `jpeg`, `png`, `webp` (default: `png`).

### Code Example
```javascript
import * as fal from "@fal-ai/serverless-client";

const result = await fal.subscribe("fal-ai/nano-banana", {
  input: {
    prompt: "A cute robot holding a flower",
    aspect_ratio: "16:9",
    num_images: 1
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.images[0].url);
```

---

## 2. Nano Banana Pro (`fal-ai/nano-banana-pro`)

**Type:** Text-to-Image
**Endpoint:** `fal-ai/nano-banana-pro`
**Description:** High-quality generation with resolution control and web search.

### Input Parameters
- **prompt** (string, required): The text prompt.
- **num_images** (integer): Number of images (1-4).
- **aspect_ratio** (enum): Aspect ratio.
  - Values: `21:9`, `16:9`, `3:2`, `4:3`, `5:4`, `1:1`, `4:5`, `3:4`, `2:3`, `9:16`
- **resolution** (enum): Output resolution.
  - Values: `1K` (1024px), `2K` (2048px), `4K` (4096px).
- **enable_web_search** (boolean): Use web search for generation (extra cost).
- **output_format** (enum): `jpeg`, `png`, `webp`.

### Code Example
```javascript
import * as fal from "@fal-ai/serverless-client";

const result = await fal.subscribe("fal-ai/nano-banana-pro", {
  input: {
    prompt: "Cyberpunk city with neon lights",
    aspect_ratio: "21:9",
    resolution: "2K",
    enable_web_search: true
  },
  logs: true,
});
```

---

## 3. Seedream 4.5 (`fal-ai/bytedance/seedream/v4.5/text-to-image`)

**Type:** Text-to-Image
**Endpoint:** `fal-ai/bytedance/seedream/v4.5/text-to-image`
**Description:** ByteDance's generation model.

### Input Parameters
- **prompt** (string, required): The text prompt.
- **image_size** (enum or object): Size of the generated image.
  - Enum Values: `square_hd`, `square`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`, `auto_2K`, `auto_4K`
  - Custom: `{"width": 1280, "height": 720}`
  - Default: `square_hd`
- **num_images** (integer): Number of images (default: 1).
- **seed** (integer): Random seed.

### Code Example
```javascript
import * as fal from "@fal-ai/serverless-client";

const result = await fal.subscribe("fal-ai/bytedance/seedream/v4.5/text-to-image", {
  input: {
    prompt: "A serene landscape",
    image_size: "landscape_16_9",
    num_images: 1
  },
  logs: true,
});
```

---

## 4. ImagineArt 1.5 (`imagineart/imagineart-1.5-preview/text-to-image`)

**Type:** Text-to-Image
**Endpoint:** `imagineart/imagineart-1.5-preview/text-to-image`
**Description:** High-fidelity visuals.

### Input Parameters
- **prompt** (string, required): The text prompt.
- **aspect_ratio** (enum): Image aspect ratio.
  - Values: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:1`, `1:3`, `3:2`, `2:3`
  - Default: `1:1`
- **seed** (integer): Seed for generation.

### Code Example
```javascript
import * as fal from "@fal-ai/serverless-client";

const result = await fal.subscribe("imagineart/imagineart-1.5-preview/text-to-image", {
  input: {
    prompt: "Abstract art",
    aspect_ratio: "3:2"
  },
  logs: true,
});
```
