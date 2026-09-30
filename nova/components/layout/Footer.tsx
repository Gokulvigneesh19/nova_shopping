import Link from "next/link";

const footerLinks = {
  Shop: ["All Products", "Deals", "New Arrivals", "Categories"],
  Support: ["Track Order", "Returns", "Shipping Info", "Contact Us"],
  Company: ["About Us", "Careers", "Blog", "Press"],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-soft-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-gradient-start to-gradient-end text-white">
                N
              </span>
              <span className="text-text-primary">
                Nova<span className="text-primary">Shop</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
              Shop the latest trends, live in style. Quality products, delivered fast.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/"
                      className="text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} NovaShop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="transition-colors hover:text-primary">Privacy</span>
            <span className="transition-colors hover:text-primary">Terms</span>
            <span className="transition-colors hover:text-primary">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
