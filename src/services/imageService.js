// Maps each image slot called for in the design spec to a real, on-theme
// photograph. No Unsplash access key is configured for this build, so each
// slot points at a specific, verified Unsplash CDN photo (chosen to match
// the scene described in prompt.md) rather than a random placeholder. If an
// access key is later added via VITE_UNSPLASH_ACCESS_KEY, only this file
// needs to change to call the real Search API — pages consume
// <Photo slot="..." /> and never build image URLs themselves.

const slots = {
  heroRight: { id: "1695653422715-991ec3a0db7a", alt: "Gig worker checking earnings on a mobile phone" },
  problemStory: { id: "1572195577046-2f25894c06fc", alt: "Delivery rider on a scooter, mid-shift" },
  solutionDashboard: { id: "1551288049-bebda4e38f71", alt: "Real-time analytics dashboard" },
  solutionPayment: { id: "1681826291722-70bd7e9e6fc3", alt: "Hands using a mobile banking app to transfer money" },
  solutionTeam: { id: "1522202176988-66273c2fd55f", alt: "Workers collaborating" },
  step1: { id: "1616077168712-fc6c788db4af", alt: "Worker logging in on a phone" },
  step2: { id: "1526628953301-3e589a6a8b74", alt: "Live dashboard with earnings metrics" },
  step3: { id: "1618486394073-ddb198a9c67e", alt: "Phone showing a completed settlement" },
  step4: { id: "1513595207829-9f414c0665f6", alt: "Phone displaying a push notification" },
  loginRight: { id: "1551825687-f9de1603ed8b", alt: "Smiling delivery worker" },
  signupRight: { id: "1659353741198-cf4a0a75bc44", alt: "Gig worker celebrating after a successful shift" },
  workerAvatar: { id: "1618298363483-e31a31f1a1e2", alt: "Chioma Adeyemi" },
};

export function getImage(slot, { width = 900 } = {}) {
  const entry = slots[slot] || { id: slot, alt: "" };
  return {
    src: `https://images.unsplash.com/photo-${entry.id}?auto=format&fit=crop&w=${width}&q=80`,
    alt: entry.alt,
  };
}
