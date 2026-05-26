import React from "react";
import Dropdown from "./Dropdown";

type Props = {
  value: "Today" | "Weekly" | "Monthly";
  onChange: (v: "Today" | "Weekly" | "Monthly") => void;
};

export const FilterDropdown: React.FC<Props> = React.memo(
  ({ value, onChange }) => {
    return (
      <div>
        <Dropdown
          options={[
            { label: "Today", value: "Today" },
            { label: "Weekly", value: "Weekly" },
            { label: "Monthly", value: "Monthly" },
          ]}
          value={value}
          onChange={(v) => onChange(v as "Today" | "Weekly" | "Monthly")}
          controlClassName="py-1 px-3 rounded-lg border border-gray-200 bg-white text-sm shadow-sm"
          className="inline-block"
          menuClassName="rounded-lg text-sm p"
        />
      </div>
    );
  },
);

export default FilterDropdown;
