export interface ModelConfig {
  id: string;
  editId?: string;
  name: string;
  type: 'text-to-image' | 'image-to-image' | 'edit';
  description: string;
  basePriceUsd?: number; // base model price (fal) if known
  inputParams?: {
    name: string;
    type: 'text' | 'number' | 'select';
    label: string;
    required?: boolean;
    default?: string | number | boolean | null;
    options?: string[];
    multiple?: boolean; // New property for multi-file upload
  }[];
}

export const AI_MODELS: ModelConfig[] = [
  {
    id: 'fal-ai/nano-banana',
    editId: 'fal-ai/nano-banana/edit',
    name: 'Nano Banana',
    type: 'text-to-image',
    description: 'Fast and cost-effective generation. Edit version will be used when you add a reference image.',
    basePriceUsd: 0.004,
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          '1:1',
          '16:9',
          '9:16',
          '4:3',
          '3:4',
          '3:2',
          '2:3',
          '5:4',
          '4:5',
          '21:9'
        ],
        default: '1:1',
      },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
      { name: 'image_urls', type: 'text', label: 'Reference Image (optional)', multiple: true },
    ],
  },
  {
    id: 'fal-ai/nano-banana-pro',
    editId: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro',
    type: 'text-to-image',
    description: 'High-quality generation with resolution control. Edit version will be used when reference images are provided.',
    basePriceUsd: 0.008,
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          '1:1',
          '16:9',
          '9:16',
          '4:3',
          '3:4',
          '3:2',
          '2:3',
          '5:4',
          '4:5',
          '21:9'
        ],
        default: '1:1',
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Resolution',
        options: ['1K', '2K', '4K'],
        default: '1K',
      },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
      {
        name: 'image_urls',
        type: 'text',
        label: 'Reference Images (optional)',
        multiple: true
      },
    ],
  },
  {
    id: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    editId: 'fal-ai/bytedance/seedream/v4.5/edit',
    name: 'Seedream 4.5',
    type: 'text-to-image',
    description: "ByteDance's generation model. Edit version will be used when reference images are provided.",
    basePriceUsd: 0.012,
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'image_size', // Correct: Seedream uses image_size enum
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          'square_hd',
          'square',
          'portrait_4_3',
          'portrait_16_9',
          'landscape_4_3',
          'landscape_16_9',
          'auto_2K',
          'auto_4K'
        ],
        default: 'square_hd',
      },
      {
        name: 'image_urls',
        type: 'text',
        label: 'Reference Images (optional)',
        multiple: true
      },
    ],
  },
  {
    id: 'imagineart/imagineart-1.5-preview/text-to-image',
    name: 'ImagineArt 1.5',
    type: 'text-to-image',
    description: 'High-fidelity visuals.',
    basePriceUsd: 0.01,
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio', // Correct: ImagineArt uses aspect_ratio
        type: 'select',
        label: 'Aspect Ratio',
        options: [
          '1:1',
          '16:9',
          '9:16',
          '4:3',
          '3:4',
          '3:1',
          '1:3',
          '3:2',
          '2:3'
        ],
        default: '1:1',
      },
    ],
  },
];
