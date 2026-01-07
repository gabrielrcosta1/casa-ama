import React from 'react';
// 1. Importe o arquivo SVG como um módulo
import logoSrc from '@/assets/logocasaam.svg';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
   
      src={logoSrc}
      alt="CASA D'AMAZÔNIA Logo"
      className={className}
      {...props}
    />
  );
}