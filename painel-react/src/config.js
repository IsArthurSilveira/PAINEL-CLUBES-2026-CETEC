export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/AKfycbx_lkDDORRykam5naXZccbzbAdW9mQmQaB79dguEKLfchsAAddansKYXdQJ7VF0Q7vyrg/exec';

export const IS_LOCALHOST = ['127.0.0.1', 'localhost'].includes(window.location.hostname);