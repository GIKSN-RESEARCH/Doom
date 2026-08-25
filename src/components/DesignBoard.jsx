"use client";

import "./DesignBoard.css";

const DesignBoard = ({ className }) => (
  <div className={`design-board${className ? ` ${className}` : ""}`} aria-hidden="true">
    <span className="design-board__grid" />
    <span className="design-board__gutter" />
    <span className="design-board__circle" />
    <span className="design-board__glyph">Aa</span>
    <span className="design-board__reg" />
    <span className="design-board__mark design-board__mark--tl" />
    <span className="design-board__mark design-board__mark--tr" />
    <span className="design-board__mark design-board__mark--bl" />
    <span className="design-board__mark design-board__mark--br" />
    <span className="design-board__meta">8-col · specimen</span>
    <span className="design-board__grain" />
  </div>
);

export default DesignBoard;
