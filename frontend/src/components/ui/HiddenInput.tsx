type HiddenInputProps = {
  name?: string;
  value: string;
};

export default function HiddenInput(props: HiddenInputProps) {
  return (
    <input
      type="hidden"
      name={props.name || "id"}
      // @ts-ignore
      prop:value={props.value}
    />
  );
}
