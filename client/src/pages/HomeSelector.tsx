import { FC } from "react";
import { useLocation } from "wouter";
import {
  UserGroupIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

type Card = {
  label: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
};

export const HomeSelector: FC = () => {
  const [, navigate] = useLocation();

  const cards: Card[] = [
    { label: "Person Nearby",       icon: UserGroupIcon,          onClick: () => navigate("/person-nearby") },
    { label: "Person Online",       icon: ComputerDesktopIcon,    onClick: () => alert("Coming soon") },
    { label: "Website",             icon: GlobeAltIcon,           onClick: () => navigate("/website-overlap") },
    { label: "Store",               icon: BuildingStorefrontIcon, onClick: () => alert("Coming soon") },
    { label: "Sign / Object",       icon: InformationCircleIcon,  onClick: () => alert("Coming soon") },
    { label: "Online Service",      icon: Cog6ToothIcon,          onClick: () => alert("Coming soon") },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="grid grid-cols-2 gap-6 max-w-md w-full p-4">
        {cards.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-800/80 p-6
                       text-slate-200 hover:bg-slate-700 hover:scale-105 transition-all shadow-lg"
          >
            <Icon className="h-10 w-10" />
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </main>
  );
};

export default HomeSelector;