// pages/_app.js
import '../styles/globals.css' // Import the Tailwind CSS styles

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} /> // Render the page component
}

export default MyApp; // Export the component as default
