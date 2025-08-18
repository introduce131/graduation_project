import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ImageHover({ defaultImg, hoverImg, label, to }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li className="footer-wrap">
      {to ? (
        <Link
          to={to}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img src={hovered ? hoverImg : defaultImg} alt={`${label}_logo`} />
          <p>{label}</p>
        </Link>
      ) : (
        <a
          href="/"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img src={hovered ? hoverImg : defaultImg} alt={`${label}_logo`} />
          <p>{label}</p>
        </a>
      )}
    </li>
  );
}

export default ImageHover;
