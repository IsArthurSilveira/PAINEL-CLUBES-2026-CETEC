export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbw7wF-mISf8_xu8w_f9-ycgih5eTgdOkFRiCmAsQD5BZt6lB7RWo099PcPPJIwYIKG4nw/exec';

export const IS_LOCALHOST = ['127.0.0.1', 'localhost'].includes(window.location.hostname);