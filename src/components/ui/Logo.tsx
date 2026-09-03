import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light' | 'colored';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

const OFFICIAL_LOGO_URL = 'https://static.wixstatic.com/media/5cdcb6_27068c396c004557843309312de91a83~mv2.png/v1/fill/w_111,h_50,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/5cdcb6_27068c396c004557843309312de91a83~mv2.png';

export const KodingNextLogo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
  showSubtitle = false,
}) => {
  const isLight = variant === 'light';

  const sizeConfigs = {
    sm: {
      height: 'h-7',
      subText: 'text-[9px]',
    },
    md: {
      height: 'h-9',
      subText: 'text-[10px]',
    },
    lg: {
      height: 'h-12',
      subText: 'text-xs',
    },
    xl: {
      height: 'h-16',
      subText: 'text-sm',
    },
  };

  const config = sizeConfigs[size];

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className={`flex items-center ${isLight ? 'brightness-0 invert' : ''}`}>
        <img
          src={OFFICIAL_LOGO_URL}
          alt="Koding Next"
          className={`${config.height} w-auto object-contain transition-all`}
        />
      </div>

      {showSubtitle && (
        <span className={`uppercase font-semibold tracking-wider text-brand-pink ${config.subText} mt-0.5 font-heading`}>
          School Management System
        </span>
      )}
    </div>
  );
};

