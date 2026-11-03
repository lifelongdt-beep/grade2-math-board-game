import { useSyncExternalStore } from 'react';
let message = '';
const listeners = new Set<() => void>();
export const storageMessage = () => message;
export const reportStorage = (value: string) => { if (message === value) return; message = value; listeners.forEach(fn => fn()); };
export const useStorageStatus = () => useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, storageMessage, () => '');
