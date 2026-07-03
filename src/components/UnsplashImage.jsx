const queries = {
  heroRight: 'delivery+worker+phone+mobile',
  problemStory: 'delivery+rider+stressed',
  solutionDashboard: 'analytics+dashboard+mobile',
  solutionPayment: 'payment+confirmation+successful',
  solutionTeam: 'diverse+workers+collaboration',
  step1: 'phone+login+interface',
  step2: 'mobile+app+metrics+dashboard',
  step3: 'payment+success+screen+mobile',
  step4: 'push+notification+mobile',
  loginRight: 'delivery+worker+smiling+happy',
  signupRight: 'gig+worker+success',
};

export default function UnsplashImage({ query, className = '', alt = '' }) {
  const q = queries[query] || query;
  return (
    <img
      src={`https://source.unsplash.com/featured/?${q}`}
      alt={alt || q.replace(/\+/g, ' ')}
      className={className}
      onError={(e) => { e.target.src = `https://picsum.photos/seed/${q}/800/600`; }}
    />
  );
}
