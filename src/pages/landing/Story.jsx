import Photo from "../../components/Photo";

export default function Story() {
  return (
    <section id="story" className="px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <Photo slot="problemStory" className="aspect-video border border-border" />
        <div>
          <h2 className="text-3xl font-bold text-ink">Meet Chioma</h2>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-body">
{`Chioma completes 25 deliveries on Monday, earning ₦12,500.

But she can't pay her rent. The platform doesn't settle until Friday.
So she borrows ₦10,000 at 25% interest to cover this week's expenses.

By Friday, she's earned less after interest than if she'd just waited.
This happens every week.

She's not struggling because deliveries aren't profitable. She's
struggling because payment delays force her into debt.`}
          </p>
          <a href="#solution" className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-dark">
            This is why SwiftSettle exists →
          </a>
        </div>
      </div>
    </section>
  );
}
