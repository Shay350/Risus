type AvatarFallbackProps = {
  name: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function AvatarFallback({ name }: AvatarFallbackProps) {
  const initials = initialsFromName(name);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#232628] to-[#191b1c]">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#2f3437] border border-[#4a4f52] shadow-xl flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-semibold text-gray-200">{initials}</span>
      </div>
    </div>
  );
}
