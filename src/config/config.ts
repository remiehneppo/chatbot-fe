declare global {
  interface Window {
    ENV: {
      VITE_BE_HOST: string;
    }
  }
}

export const config = {
  apiUrl: window.ENV?.VITE_BE_HOST || 'http://localhost:88888'
};