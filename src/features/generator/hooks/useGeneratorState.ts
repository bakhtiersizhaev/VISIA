import { useState, useCallback } from 'react';
import type { ModelConfig } from '@/lib/ai/models';
import type { InputValue } from '@/types/generator-types';
import { AI_MODELS } from '@/lib/ai/models';

/**
 * Custom hook for managing generator UI state
 * Handles model selection, input values, and compare mode
 */
export function useGeneratorState() {
    const [selectedModel, setSelectedModel] = useState<ModelConfig>(AI_MODELS[0]);
    const [inputValues, setInputValues] = useState<Record<string, InputValue>>({});

    // Compare Mode State
    const [compareMode, setCompareMode] = useState(false);
    const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());

    // Handle input changes with validation
    const handleInputChange = useCallback((name: string, value: InputValue) => {
        setInputValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Toggle compare mode
    const toggleCompareMode = useCallback(() => {
        setCompareMode((prev) => !prev);
        if (!compareMode) {
            // When enabling compare mode, add current model to selection
            setSelectedModels(new Set([selectedModel.id]));
        }
    }, [compareMode, selectedModel.id]);

    // Toggle model selection in compare mode
    const toggleModelSelection = useCallback((modelId: string) => {
        setSelectedModels((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(modelId)) {
                newSet.delete(modelId);
            } else {
                newSet.add(modelId);
            }
            return newSet;
        });
    }, []);

    return {
        // Model selection
        selectedModel,
        setSelectedModel,

        // Input values
        inputValues,
        setInputValues,
        handleInputChange,

        // Compare mode
        compareMode,
        setCompareMode,
        toggleCompareMode,
        selectedModels,
        setSelectedModels,
        toggleModelSelection,
    };
}
