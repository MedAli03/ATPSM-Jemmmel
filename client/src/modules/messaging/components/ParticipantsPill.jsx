const ParticipantsPill = ({ participants = [] }) => {
  const resolved = participants.length ? participants : [];
  if (!resolved.length) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {resolved.slice(0, 3).map((participant) => (
          <img
            key={participant.id}
            src={participant.avatarUrl}
            alt={participant.name}
            className="h-8 w-8 rounded-full border border-white object-cover shadow-sm"
          />
        ))}
        {resolved.length > 3 ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-200 text-xs font-semibold text-slate-600">
            +{resolved.length - 3}
          </span>
        ) : null}
      </div>
      <span className="text-xs text-slate-600 dark:text-slate-300">
        {resolved.map((participant) => participant.name).join("، ")}
      </span>
    </div>
  );
};

export default ParticipantsPill;
