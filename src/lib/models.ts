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
    id: 'fal-ai/fast-sdxl',
    name: 'Nano Banana',
    type: 'text-to-image',
    description: 'Ultra-fast generation, cost-effective (SDXL Lightning).',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
    ],
  },
  {
    id: 'fal-ai/fast-lightning-sdxl',
    name: 'Nano Banana Pro',
    type: 'text-to-image',
    description: 'High quality, fast speed (SDXL Lightning).',
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
    ],
  },
  {
    id: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    name: 'Seedream 4.5',
    type: 'text-to-image',
    description: "ByteDance's new generation image model.",
    inputParams: [
      { name: 'prompt', type: 'text', label: 'Prompt', required: true },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Aspect Ratio',
        options: ['1:1', '4:3', '3:4', '16:9', '9:16'],
        default: '1:1',
      },
      { name: 'num_images', type: 'number', label: 'Number of Images', default: 1 },
    ],
  },
];
