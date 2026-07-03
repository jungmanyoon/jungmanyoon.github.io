/// <reference types="vite/client" />

declare module '*.jsx' {
    import React from 'react';
    const component: React.ComponentType<any>;
    export default component;
}

declare module '*.js' {
    const content: any;
    export default content;
}

// File System Access API - lib.dom에 아직 표준 포함되지 않은 부분 보강.
// (호출 전 'showDirectoryPicker' in window 등으로 지원 여부를 런타임에 가드함)
interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
}
interface FileSystemHandle {
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}
interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle & { kind: 'file' | 'directory'; name: string }>;
}
interface Window {
    showDirectoryPicker(options?: {
        mode?: 'read' | 'readwrite';
        startIn?: string;
    }): Promise<FileSystemDirectoryHandle>;
}
