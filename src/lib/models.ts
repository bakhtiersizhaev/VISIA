export interface ModelConfig {
  id: string;
  name: string;
  type: 'text-to-image' | 'image-to-image' | 'edit';
  description: string;
  inputParams?: {
    name: string;
    type: 'text' | 'number' | 'select';
    label: string;
    required?: boolean;
    default?: any;
    options?: string[];
  }[];
}

export const AI_MODELS: ModelConfig[] = [
  {
    id: 'fal-ai/nano-banana',
    name: 'Nano Banana',
    type: 'text-to-image',
    description: 'Fast and cost-effective generation.',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'image_size',
        type: 'select',
        label: 'Aspect Ratio',
        options: ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'],
        default: 'square_hd',
      },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
    ],
  },
  {
    id: 'fal-ai/nano-banana/edit',
    name: 'Nano Banana (Edit)',
    type: 'edit',
    description: 'Edit images with Nano Banana.',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      { name: 'image_url', type: 'text', label: 'Image URL', required: true },
    ],
  },
  {
    id: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    name: 'Seedream 4.5',
    type: 'text-to-image',
    description: "ByteDance's generation model.",
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        options: ['1:1', '4:3', '3:4', '16:9', '9:16'],
        default: '1:1',
      },
      { name: 'image_size', type: 'select', label: 'Resolution', options: ['1024x1024', '512x512'], default: '1024x1024' },
    ],
  },
  {
    id: 'fal-ai/bytedance/seedream/v4.5/edit',
    name: 'Seedream 4.5 (Edit)',
    type: 'edit',
    description: 'Edit images with Seedream.',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      { name: 'image_url', type: 'text', label: 'Image URL', required: true },
    ],
  },
  {
    id: 'imagineart/imagineart-1.5-preview/text-to-image',
    name: 'ImagineArt 1.5',
    type: 'text-to-image',
    description: 'High-fidelity visuals.',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        options: ['1:1', '16:9', '9:16', '3:2', '2:3'],
        default: '1:1',
      },
    ],
  },
];
