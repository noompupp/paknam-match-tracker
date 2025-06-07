
interface SocialMediaStoryMatchInfoProps {
  fixture: any;
}

const SocialMediaStoryMatchInfo = ({ fixture }: SocialMediaStoryMatchInfoProps) => {
  return (
    <div className="text-center text-sm text-gray-600 space-y-1">
      {fixture?.match_date && (
        <div>
          {new Date(fixture.match_date).toLocaleDateString()}
        </div>
      )}
      {fixture?.venue && (
        <div>
          {fixture.venue}
        </div>
      )}
    </div>
  );
};

export default SocialMediaStoryMatchInfo;
