import "./Footer.css";

function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {anioActual} Agustín Tacconi.</p>
    </footer>
  );
}

export default Footer;