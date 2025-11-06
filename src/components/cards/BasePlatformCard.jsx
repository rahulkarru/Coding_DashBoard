import React, { useState } from "react";
import { LOGOS } from "../../styles/logos.js";
import useThemedStyles from "../../styles/useThemedStyles.js";

const BasePlatformCard = ({ platformName, title, big, mid, sub, link, chips = [] }) => {
  const { platformThemes, cardBase } = useThemedStyles();
  const theme = platformThemes[platformName] ?? platformThemes.Codeforces;
  const [hover, setHover] = useState(false);
  const logo = LOGOS[platformName];

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={cardBase.link}>
      <div
        style={{ ...cardBase.wrapper(theme), ...(hover ? cardBase.wrapperHover : {}) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {logo && <img src={logo} alt="" aria-hidden="true" style={cardBase.logoBg} />}
        <h3 style={cardBase.name}>{title}</h3>
        <p style={cardBase.big}>{big}</p>
        {mid && <p style={cardBase.midAccent(theme)}>{mid}</p>}
        {sub && <p style={cardBase.sub}>{sub}</p>}

        {chips.length > 0 && (
          <div style={cardBase.chipRow}>
            {chips.map((c, i) => (
              <span key={i} style={cardBase.chip(theme)}>{c}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};

export default BasePlatformCard;
