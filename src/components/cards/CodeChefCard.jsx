import React from "react";
import BasePlatformCard from "./BasePlatformCard";

const CodeChefCard = ({
  currentRating,
  starRating,
  peakRating,
  contestsAttended,
  link,
  manual,
}) => {
  const chips = [];

  // Show star rating as a chip (e.g. "3★")
  if (starRating && starRating !== "N/A") chips.push(starRating);

  // Show "Manual" chip if fallback data is used
  if (manual) chips.push("Manual");

  return (
    <BasePlatformCard
      platformName="CodeChef"
      title="CodeChef"
      big={currentRating || "N/A"} // main large number
      mid={chips}
      sub={`Peak: ${peakRating || "N/A"} | Contests: ${contestsAttended ||"N/A" }`} // subtitle line
      link={link}
      //chips={chips} // show chips like ★ or Manual
    />
  );
};

export default CodeChefCard;
