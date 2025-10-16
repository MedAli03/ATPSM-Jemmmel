import PropTypes from "prop-types";

const EmptyState = ({ title, description, icon = "💬" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center text-slate-600">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && <p className="text-sm leading-7">{description}</p>}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
};

export default EmptyState;
