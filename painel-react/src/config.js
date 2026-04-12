export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbz3PlOFnjV3ZosqpRWhmVAnnSAKVp3AmR6z1SvRlI2lMIvtp8DAJwCccod9rfn2-mNa0Q/exec';

export const IS_LOCALHOST = ['127.0.0.1', 'localhost'].includes(window.location.hostname);