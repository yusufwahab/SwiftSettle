import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/States";
import { supportService } from "../services";
import { useAsync } from "../hooks/useAsync";

export default function SupportPage() {
  const questionsState = useAsync(() => supportService.getPopularQuestions(), []);
  const faqState = useAsync(() => supportService.getFaqCategories(), []);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const id = setTimeout(() => {
      supportService.search(query).then((data) => {
        setResults(data);
        setSearching(false);
      });
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <AppLayout title="Help & Support" subtitle="Get answers to your questions">
      <div className="mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for answers... (e.g., 'How do I settle my earnings?')"
          className="w-full rounded border border-border-strong bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-primary"
        />
        {query.trim() && (
          <Card className="mt-3">
            {searching && (
              <div className="space-y-3 py-2">
                <Skeleton className="h-5" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            )}
            {!searching && results && results.length === 0 && (
              <EmptyState title="No results" message="Try a different search term." className="py-6" />
            )}
            {!searching && results && results.length > 0 && (
              <ul className="divide-y divide-border">
                {results.map((r) => (
                  <li key={r.q} className="py-3">
                    <p className="text-sm font-medium text-ink">{r.q}</p>
                    <p className="mt-1 text-sm text-muted">{r.a}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>

      <p className="mb-4 text-sm font-bold text-ink">Popular Questions</p>
      <div className="mb-10 grid gap-5 sm:grid-cols-3">
        {questionsState.status === "loading" &&
          [0, 1, 2].map((i) => (
            <Card key={i}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-5" />
              <Skeleton className="mt-2 h-4" />
            </Card>
          ))}
        {questionsState.status === "error" && (
          <div className="sm:col-span-3">
            <ErrorState message={questionsState.error} onRetry={questionsState.reload} />
          </div>
        )}
        {questionsState.status === "success" &&
          questionsState.data.map((item) => (
            <Card key={item.id} className="transition-colors hover:border-primary">
              <Badge tone="neutral">{item.category}</Badge>
              <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
              <button type="button" className="mt-3 text-sm text-primary hover:text-primary-dark">
                Read More
              </button>
            </Card>
          ))}
      </div>

      <p className="mb-4 text-sm font-bold text-ink">Frequently Asked Questions</p>
      <div className="mb-10 grid gap-8 lg:grid-cols-2">
        {faqState.status === "loading" && (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        )}
        {faqState.status === "error" && (
          <div className="lg:col-span-2">
            <ErrorState message={faqState.error} onRetry={faqState.reload} />
          </div>
        )}
        {faqState.status === "success" &&
          faqState.data.map((category) => (
            <div key={category.id}>
              <p className="mb-3 text-sm font-semibold text-ink">{category.title}</p>
              {category.items.map((item) => (
                <AccordionItem key={item.q} {...item} />
              ))}
            </div>
          ))}
      </div>

      <Card>
        <p className="mb-6 text-sm font-bold text-ink">Still need help?</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ContactOption title="Email Us" detail="support@swiftsettle.app" sub="24 hours response" />
          <ContactOption title="Live Chat" detail="Available" detailTone="text-success" sub="Mon-Fri, 9 AM - 6 PM" />
          <ContactOption title="Call Us" detail="+234 800 SETTLE (735835)" sub="Mon-Fri, 9 AM - 5 PM" />
        </div>
      </Card>
    </AppLayout>
  );
}

function ContactOption({ title, detail, sub, detailTone = "text-muted" }) {
  return (
    <div className="rounded p-5 text-center transition-colors hover:bg-surface-alt">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className={`mt-1 text-sm ${detailTone}`}>{detail}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-surface-alt px-4 py-4 text-left hover:bg-border/40"
      >
        <span className="text-sm font-medium text-ink">{q}</span>
        <span className="text-sm text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="bg-white px-4 py-4 text-sm text-muted">{a}</div>}
    </div>
  );
}
