import { forwardRef, type SVGProps } from "react";
import { cn } from "@2block/shared/utils";;

const AnimatedSpinner = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn(className)}
    >
      <g className="animated-spinner">
        <rect x="11" y="1" width="2" height="5" opacity=".14" />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(30 12 12)"
          opacity=".29"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(60 12 12)"
          opacity=".43"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(90 12 12)"
          opacity=".57"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(120 12 12)"
          opacity=".71"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(150 12 12)"
          opacity=".86"
        />
        <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" />
      </g>
    </svg>
  ),
);
AnimatedSpinner.displayName = "AnimatedSpinner";

export { AnimatedSpinner };

export {
  PiHandPeace,
  PiHandPeaceFill,
  PiHandPeaceLight,
  PiHandPeaceThin,
}
  from "react-icons/pi";

export { 
  FontAwesomeIcon 
} from '@fortawesome/react-fontawesome';


export {
  faGoogle
} from "@fortawesome/free-brands-svg-icons";

export {
  EyeOpenIcon,
  EyeNoneIcon as EyeCloseIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  ExitIcon,
  EnterIcon,
  GearIcon,
  PlusIcon,
  HamburgerMenuIcon,
  Pencil2Icon,
  UpdateIcon,
  CheckCircledIcon,
  PlayIcon,
  TrashIcon,
  ArchiveIcon,
  ResetIcon,
  DiscordLogoIcon,
  GitHubLogoIcon,
  FileTextIcon,
  IdCardIcon,
  PlusCircledIcon,
  FilePlusIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
