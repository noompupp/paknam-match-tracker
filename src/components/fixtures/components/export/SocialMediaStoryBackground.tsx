
const SocialMediaStoryBackground = () => {
  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-indigo-900/95" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>
    </>
  );
};

export default SocialMediaStoryBackground;
