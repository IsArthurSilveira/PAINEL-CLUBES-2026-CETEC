const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbyFk5qxo3sRlIMSLrgOa0fLKTcZzUt57FS75hkI7RVqgxnZkYGY05oIsN-aGi3HlExg5g/exec';

export const API_URL: string = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
export const IS_LOCALHOST: boolean = ['127.0.0.1', 'localhost'].includes(currentHost);
