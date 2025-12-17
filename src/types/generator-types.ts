/**
 * Type definitions for the Generator UI
 * Extracted from generator-ui.tsx for better maintainability
 */

export type InputValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | File
    | File[]
    | (string | File | number | boolean)[]
    | null
    | undefined;

export type FalImage = { url: string };

export type FalResponse = {
    images?: FalImage[];
    data?: { images?: FalImage[] }
};

export type FalQueueUpdate = {
    status?: string;
    logs?: { message?: string | null | undefined }[];
};

export interface GenerationJob {
    id: string;
    prompt: string;
    model: import('@/lib/ai/models').ModelConfig;
    modelIdUsed: string;
    status: 'pending' | 'running' | 'done' | 'error';
    images: string[];
    error: string | null;
    elapsedTime: number;
    logs: string[];
    startTime: number;
    abortController: AbortController | null;
    inputValues: Record<string, InputValue>;
}

export const USD_PER_TOKEN = 0.01;
export const MAX_PARALLEL_JOBS = 5;
