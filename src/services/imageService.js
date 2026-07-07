// Maps each image slot called for in the design spec to a real, on-theme
// photograph. No Unsplash access key is configured for this build, so each
// slot points at a specific, verified Unsplash CDN photo rather than a
// random placeholder. If an access key is later added via
// VITE_UNSPLASH_ACCESS_KEY, only this file needs to change to call the real
// Search API — pages consume <Photo slot="..." /> and never build image
// URLs themselves.
//
// Photos depicting people were deliberately chosen to show Black/African
// subjects (Nomba builds for African markets) — each one below was picked
// from a photographer/location/tag signal confirming that (e.g. explicit
// "Nigerian woman"/"Black man" tags, or photographer + location credited
// to Nigeria/Cameroon), not guessed at. The 4 pure UI-screenshot slots
// (solutionDashboard, step2-4) show no people, so they're unchanged.

const slots = {
  heroRight: { id: "1553448056-b6146f67f31c", alt: "Gig worker checking earnings on a mobile phone" },
  problemStory: { id: "1598890335561-884eccb92531", alt: "Delivery rider on a motorcycle, mid-shift" },
  solutionDashboard: { id: "1551288049-bebda4e38f71", alt: "Real-time analytics dashboard" },
  solutionPayment: { id: "1633504214759-e1013f422ed7", alt: "Hands using a mobile banking app to transfer money" },
  solutionTeam: { id: "1653565684985-0b1a64cf7afc", alt: "Workers collaborating" },
  step1: { id: "1634313907443-38338d5235dc", alt: "Worker logging in on a phone" },
  step2: { id: "1526628953301-3e589a6a8b74", alt: "Live dashboard with earnings metrics" },
  step3: { id: "1618486394073-ddb198a9c67e", alt: "Phone showing a completed settlement" },
  step4: { id: "1513595207829-9f414c0665f6", alt: "Phone displaying a push notification" },
  loginRight: { id: "1601979107569-731e84cee3e8", alt: "Smiling delivery worker" },
  signupRight: { id: "1676151216172-33833bc78fd0", alt: "Gig worker celebrating after a successful shift" },
  workerAvatar: { id: "1756588534346-e8899364757b", alt: "Chioma Adeyemi" },
};

export function getImage(slot, { width = 900 } = {}) {
  const entry = slots[slot] || { id: slot, alt: "" };
  return {
    src: `https://images.unsplash.com/photo-${entry.id}?auto=format&fit=crop&w=${width}&q=80`,
    alt: entry.alt,
  };
}
