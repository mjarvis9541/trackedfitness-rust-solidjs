type CheckboxProps = {
  data: { id: string }[];
  checked: any[];
  setChecked: any;
};

export default function CheckboxAll(props: CheckboxProps) {
  return (
    <input
      type="checkbox"
      disabled={props.data.length === 0}
      checked={
        props.data.length !== 0 &&
        props.data.every((obj) => props.checked.includes(obj.id))
      }
      onInput={(e) => {
        if (e.target.checked) {
          props.setChecked([...props.data.map((obj) => obj.id)]);
        } else {
          props.setChecked([]);
        }
      }}
    />
  );
}
