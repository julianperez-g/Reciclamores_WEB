import Image from "next/image";
import Link from "next/link";


export default function SiteHeader() {
  return (
    <header className="site-header">

      <div className="site-header-cloud site-header-cloud-one" />
      <div className="site-header-cloud site-header-cloud-two" />
      <div className="site-header-cloud site-header-cloud-three" />


      <div className="site-header-doodle site-header-doodle-one">
        ✦
      </div>

      <div className="site-header-doodle site-header-doodle-two">
        ∿
      </div>


      <div className="site-header-inner">

        <Link
          href="/"
          className="site-header-logo"
          aria-label="Ir al inicio"
        >
          <Image
            src="/brand/reciclamores-logo.png"
            alt="Reciclamores ONG"
            width={250}
            height={90}
            priority
          />
        </Link>


        <nav
          className="site-header-nav"
          aria-label="Navegación principal"
        >

          <Link
            href="/"
            className="site-header-nav-link"
          >
            Inicio
          </Link>


          <Link
            href="/residuos"
            className="site-header-nav-link"
          >
            Residuos
          </Link>


          <Link
            href="/faqs"
            className="site-header-nav-link"
          >
            Preguntas
          </Link>


          <a
            href="https://reciclamores.org/"
            target="_blank"
            rel="noreferrer"
            className="site-header-main-site"
          >
            Reciclamores

            <span aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M7 17L17 7M9 7H17V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>

        </nav>

      </div>

    </header>
  );
}