const LoadingSkeleton = ({
  variant = "text",
  width = "100%",
  height,
  count = 1,
  className = "",
}) => {
  const variants = {
    text: "h-4 rounded",
    title: "h-6 rounded",
    card: "h-24 w-full rounded-xl",
    avatar: "rounded-full",
    button: "h-10 w-24 rounded-xl",
    input: "h-11 w-full rounded-xl",
    stat: "h-32 w-full rounded-2xl",
    chart: "h-64 w-full rounded-xl",
    row: "h-16 w-full rounded-xl",
  };

  const baseStyle = {
    width,
    height: height || undefined,
  };

  const skeletonItems = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton animate-pulse ${variants[variant]} ${className}`}
      style={baseStyle}
      aria-hidden="true"
    />
  ));

  if (count === 1) {
    return skeletonItems[0];
  }

  return <div className="space-y-3">{skeletonItems}</div>;
};

const SkeletonCard = ({ className = "", count = 3 }) => {
  return (
    <div className={`space-y-4 ${className}`} aria-busy="true" aria-label="Loading content">
      <LoadingSkeleton variant="stat" count={1} />
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton key={i} variant="row" />
      ))}
    </div>
  );
};

const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="table-container" aria-busy="true" aria-label="Loading table">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="text-left">
                  <LoadingSkeleton variant="text" width="80%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <td key={colIndex}>
                    <LoadingSkeleton variant="text" width="60%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SkeletonDashboard = () => {
  return (
    <div className="page-shell" aria-busy="true" aria-label="Loading dashboard">
      <div className="page-header">
        <div>
          <LoadingSkeleton variant="title" width="40%" />
          <LoadingSkeleton variant="text" width="60%" className="mt-2" />
        </div>
        <LoadingSkeleton variant="button" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 mb-4">
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="stat" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 mb-4">
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="stat" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 mb-4">
        <LoadingSkeleton variant="stat" />
        <LoadingSkeleton variant="stat" />
      </div>
      <LoadingSkeleton variant="chart" />
    </div>
  );
};

export { LoadingSkeleton, SkeletonCard, SkeletonTable, SkeletonDashboard };