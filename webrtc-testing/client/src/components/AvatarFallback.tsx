/* eslint-disable @next/next/no-img-element */

type AvatarFallbackProps = {
  name: string;
};

export default function AvatarFallback({ name }: AvatarFallbackProps) {
  const avatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${name === "Alpha" ? "Christopher" : "Emery"}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#232628] to-[#191b1c]">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-xl flex items-center justify-center">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
