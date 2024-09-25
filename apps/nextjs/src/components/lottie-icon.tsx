import Lottie, { LottieRefCurrentProps } from "lottie-react";
import type { LottieComponentProps } from "lottie-react";
import { useState, useRef, useEffect } from "react";

interface LottieIconProps extends Omit<LottieComponentProps, "animationData"> {
  iconName: string;
  playOnHover?: boolean;
  speed?: number;
  className?: string;
}

export function LottieIcon({ iconName, playOnHover = false, speed = 1, className, ...props }: LottieIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    void import(`../../assets/${iconName}.json`).then(module => setAnimationData(module.default));
  }, [iconName]);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={!playOnHover}
        className={className}
        {...props}
      />
    </div>
  );
}