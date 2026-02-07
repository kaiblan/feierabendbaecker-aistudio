import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const LockIcon: React.FC<IconProps> = ({ title = 'Lock', className = '', ...props }) => (
  <svg
    className={className}
    viewBox="0 0 834 1230"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden={title ? undefined : 'true'}
    style={{ verticalAlign: 'middle', ...(props.style as React.CSSProperties) }}
    {...props}
  >
    {title ? <title>{title}</title> : null}
    <g transform="matrix(1,0,0,1,-958.280417,-228.924731)">
      <g transform="matrix(1,0,0,1.942498,-22.225044,-391.226825)">
        <path d="M1667,486L1667,759C1667,836 1546,898 1397,898C1248,898 1127,836 1127,759L1127,486C1127,409 1248,347 1397,347C1546,347 1667,409 1667,486Z" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 69, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
      </g>
      <g transform="matrix(1.182965,0,0,1,-220.027539,2.222504)">
        <path d="M1701,845L1701,1342C1701,1405 1657,1456 1604,1456L1092,1456C1039,1456 996,1405 996,1342L996,845C996,782 1039,731 1092,731L1604,731C1657,731 1701,782 1701,845ZM1309,1107L1309,1215C1309,1228 1318,1238 1329,1238L1368,1238C1379,1238 1388,1228 1388,1215L1388,1107C1408,1091 1421,1065 1421,1035C1421,987 1388,949 1348,949C1308,949 1276,987 1276,1035C1276,1065 1289,1091 1309,1107Z" style={{ fill: 'currentColor', stroke: 'none' }} />
      </g>
    </g>
  </svg>
);

export default LockIcon;
