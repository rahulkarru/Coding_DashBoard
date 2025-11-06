import React from "react";
import BasePlatformCard from "./BasePlatformCard";

const CodeforcesCard = ({ summary, link }) => {
  const rankChip = summary.rank && summary.rank !== "N/A" ? summary.rank : null;
  const maxChip = summary.maxRank ? `Max ${summary.maxRank}` : null;
  const chips = [rankChip, maxChip].filter(Boolean);

  return (
    <BasePlatformCard
      platformName="Codeforces"
      title="Codeforces"
      big={summary.rating}
      mid={summary.rank}
      sub={`Peak: ${summary.maxRating}`}
      link={link}
      chips={chips}
    />
  );
};

export default CodeforcesCard;
