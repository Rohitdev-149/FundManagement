import { forwardRef, useMemo } from "react";

const Table = forwardRef(
  (
    {
      columns = [],
      data = [],
      keyField = "id",
      className = "",
      emptyMessage = "No data available",
      renderRow,
      onRowClick,
      striped = true,
      hoverable: _hoverable = true,
      mobileCard = true,
      mobileCardRender,
    },
    ref,
  ) => {
    const hasData = data.length > 0;

    const mobileCardContent = useMemo(() => {
      if (!mobileCard) return null;

      return data.map((row, rowIndex) => {
        const key = row[keyField] || rowIndex;
        if (mobileCardRender) {
          return mobileCardRender(row, rowIndex);
        }
        return (
          <div key={key} className="table-mobile-card" role="listitem">
            {columns.map((col) => (
              <div key={col.key} className="table-mobile-card-row">
                <span className="table-mobile-card-label">{col.header}</span>
                <span className="table-mobile-card-value">
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        );
      });
    }, [data, columns, keyField, mobileCard, mobileCardRender]);

    if (!hasData) {
      return (
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">
            <svg
              className="size-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="empty-state-title">No Data</p>
          <p className="empty-state-description">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className={`table-container ${className}`} ref={ref}>
        <div className="overflow-x-auto">
          <table className="table" role="grid">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width, minWidth: col.minWidth }}
                    className={col.align ? `text-${col.align}` : ""}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => {
                const key = row[keyField] || rowIndex;
                const rowProps = onRowClick
                  ? {
                      onClick: () => onRowClick(row, rowIndex),
                      className: "cursor-pointer",
                      tabIndex: 0,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row, rowIndex);
                        }
                      },
                      role: "button",
                      "aria-pressed": false,
                    }
                  : {};

                return (
                  <tr
                    key={key}
                    {...rowProps}
                    className={
                      striped && rowIndex % 2 === 1
                        ? "bg-[var(--color-surface-hover)]"
                        : ""
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={col.align ? `text-${col.align}` : ""}
                      >
                        {renderRow
                          ? renderRow(row, rowIndex, col)
                          : col.render
                            ? col.render(row, rowIndex)
                            : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {mobileCard && (
          <div
            className="block lg:hidden"
            role="list"
            aria-label="Mobile card view"
          >
            {mobileCardContent}
          </div>
        )}
      </div>
    );
  },
);

Table.displayName = "Table";

export default Table;
