type CheckboxProps = {
  data: { id: string };
  checked: any[];
  setChecked: any;
};

export default function Checkbox(props: CheckboxProps) {
  return (
    <input
      type="checkbox"
      name="checkbox"
      value={props.data.id}
      checked={props.checked.includes(props.data.id)}
      onInput={(e) => {
        if (e.currentTarget.checked) {
          props.setChecked([...props.checked, e.currentTarget.value]);
        } else {
          props.setChecked((prev: any[]) =>
            prev.filter((id: string) => id !== e.currentTarget.value),
          );
        }
      }}
    />
  );
}
