declare global {
  interface Window {
    ENV: {
      VITE_BE_HOST: string;
    }
  }
}

export const config = {
  apiUrl: import.meta.env.VITE_BE_HOST || window.ENV?.VITE_BE_HOST
};