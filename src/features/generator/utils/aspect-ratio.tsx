import React from 'react';

/**
 * Display name mapping for aspect ratios
 * Converts technical names to user-friendly labels
 */
export const ASPECT_RATIO_DISPLAY_NAMES: Record<string, string> = {
    // Standard format (already nice)
    '1:1': '1:1',
    '16:9': '16:9',
    '9:16': '9:16',
    '4:3': '4:3',
    '3:4': '3:4',
    '3:2': '3:2',
    '2:3': '2:3',
    '5:4': '5:4',
    '4:5': '4:5',
    '21:9': '21:9',
    // Seedream format -> User-friendly
    'square_hd': 'Square HD',
    'square': 'Square',
    'landscape_16_9': 'Landscape 16:9',
    'portrait_16_9': 'Portrait 16:9',
    'landscape_4_3': 'Landscape 4:3',
    'portrait_4_3': 'Portrait 4:3',
    'auto_2K': 'Auto 2K',
    'auto_4K': 'Auto 4K',
};

/**
 * Get orientation type from aspect ratio
 */
export type AspectOrientation = 'square' | 'landscape' | 'portrait' | 'auto';

export function getAspectOrientation(ratio: string): AspectOrientation {
    // Handle named formats
    if (ratio.includes('square')) return 'square';
    if (ratio.includes('landscape')) return 'landscape';
    if (ratio.includes('portrait')) return 'portrait';
    if (ratio.includes('auto')) return 'auto';

    // Handle numeric formats like "16:9", "9:16", "1:1"
    const parts = ratio.split(':');
    if (parts.length === 2) {
        const width = parseInt(parts[0], 10);
        const height = parseInt(parts[1], 10);
        if (width === height) return 'square';
        if (width > height) return 'landscape';
        return 'portrait';
    }

    return 'square';
}

/**
 * Icon component showing aspect ratio preview shape
 */
interface AspectRatioIconProps {
    ratio: string;
    className?: string;
}

export function AspectRatioIcon({ ratio, className = '' }: AspectRatioIconProps) {
    const orientation = getAspectOrientation(ratio);

    // Base styles
    const baseStyles = 'rounded-[2px] border border-current';

    // Size based on orientation
    const sizeStyles = {
        square: 'w-3 h-3',
        landscape: 'w-4 h-2.5',
        portrait: 'w-2.5 h-4',
        auto: 'w-3.5 h-3',
    };

    return (
        <div
            className={`${baseStyles} ${sizeStyles[orientation]} ${className}`}
            aria-hidden="true"
        />
    );
}

/**
 * Get display name for aspect ratio
 */
export function getAspectRatioDisplayName(ratio: string): string {
    return ASPECT_RATIO_DISPLAY_NAMES[ratio] || ratio;
}
