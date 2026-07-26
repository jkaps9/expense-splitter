import Link from "next/link";
import siteConfig from "@/data/site-config.json";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

export default function Header() {
  return (
    <header>
      <div className="container row">
        <div className="logo">
          <Link href="/">
            <span>{siteConfig.siteName}</span>
          </Link>
        </div>
        <nav className="links row">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
