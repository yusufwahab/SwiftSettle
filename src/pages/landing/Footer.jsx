const columns = [
  { heading: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
  { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { heading: "Resources", links: ["Documentation", "API Docs", "Support", "Status"] },
  { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
];

export default function Footer() {
  return (
    <footer className="bg-surface-alt px-6 py-16 text-muted sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-bold text-ink">{col.heading}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 max-w-6xl border-t border-border pt-8 text-center text-sm">
        © 2026 SwiftSettle. All rights reserved.
      </div>
    </footer>
  );
}
