import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GenerationJob } from '@/types/generator-types';
import { MAX_PARALLEL_JOBS } from '@/types/generator-types';

/**
 * Custom hook for managing job queue
 * Handles job lifecycle: add, update, remove, cancel
 * Automatically tracks elapsed time for running jobs
 */
export function useJobQueue() {
    const [jobs, setJobs] = useState<GenerationJob[]>([]);

    // Timer for running jobs - update elapsed time
    useEffect(() => {
        const runningJobs = jobs.filter((j) => j.status === 'running');
        if (runningJobs.length === 0) return;

        const interval = setInterval(() => {
            setJobs((prev) =>
                prev.map((job) => {
                    if (job.status === 'running') {
                        return { ...job, elapsedTime: (Date.now() - job.startTime) / 1000 };
                    }
                    return job;
                })
            );
        }, 50);

        return () => clearInterval(interval);
    }, [jobs]);

    // Calculate active jobs (running or pending)
    const activeJobs = useMemo(
        () => jobs.filter((j) => j.status === 'running' || j.status === 'pending'),
        [jobs]
    );

    // Add a new job to the queue
    const addJob = useCallback((job: GenerationJob) => {
        setJobs((prev) => [...prev, job]);
    }, []);

    // Update a specific job
    const updateJob = useCallback((id: string, updates: Partial<GenerationJob>) => {
        setJobs((prev) =>
            prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
        );
    }, []);

    // Remove a job from the queue
    const removeJob = useCallback((id: string) => {
        setJobs((prev) => prev.filter((job) => job.id !== id));
    }, []);

    // Cancel a running job
    const cancelJob = useCallback((id: string) => {
        setJobs((prev) =>
            prev.map((job) => {
                if (job.id === id) {
                    job.abortController?.abort();
                    return {
                        ...job,
                        status: 'error' as const,
                        error: 'Cancelled by user',
                    };
                }
                return job;
            })
        );
    }, []);

    return {
        jobs,
        activeJobs,
        addJob,
        updateJob,
        removeJob,
        cancelJob,
        // Clear all jobs (useful to recover from stuck states)
        clearJobs: () => setJobs([]),
    };
}
