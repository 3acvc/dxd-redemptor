import Select from "react-select";
import { getStyles } from "components/form/Select";
import { DXDAO_ADDRESS_LIST } from "../../constants";

export type AddressOption = typeof DXDAO_ADDRESS_LIST[0];

export function AddressListOptions({
  onChange,
  value,
}: {
  value: AddressOption[];
  onChange: (nextOptions: AddressOption[]) => void;
}) {
  return (
    <Select<AddressOption, true>
      value={value}
      options={DXDAO_ADDRESS_LIST}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.address}
      isMulti={true}
      isSearchable={true}
      id="address-list"
      styles={getStyles()}
      components={{
        IndicatorSeparator: () => null,
        DropdownIndicator: () => null,
      }}
      onChange={(nextOptions) => {
        onChange(nextOptions as AddressOption[]);
      }}
      closeMenuOnSelect={false}
    />
  );
}
