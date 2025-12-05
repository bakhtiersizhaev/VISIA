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
    multiple?: boolean; // New property for multi-file upload
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
        name: 'aspect_ratio', // FIXED: was image_size
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
    ],
  },
  {
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro',
    type: 'text-to-image',
    description: 'High-quality generation with resolution control.',
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
      {
        name: 'aspect_ratio', // Assuming edit also supports aspect_ratio or output size, but usually edit keeps original or uses mask. Keeping simple for now.
        type: 'select',
        label: 'Output Ratio',
        options: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        default: '1:1',
      },
    ],
  },
  {
    id: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro (Edit)',
    type: 'edit',
    description: 'Advanced editing with multiple inputs.',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'image_urls',
        type: 'text',
        label: 'Reference Images',
        required: true,
        multiple: true
      },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Output Ratio',
        options: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        default: '1:1',
      },
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
      {
        name: 'image_size',
        type: 'select',
        label: 'Output Size',
        options: [
          'square_hd',
          'square',
          'portrait_4_3',
          'portrait_16_9',
          'landscape_4_3',
          'landscape_16_9'
        ],
        default: 'square_hd',
      },
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
