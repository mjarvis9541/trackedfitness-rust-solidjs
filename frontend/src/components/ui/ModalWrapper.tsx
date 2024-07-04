import { CloseIcon } from "./Icon";

export default function ModalWrapper(props: any) {
  return (
    <div>
      <div class="fixed left-0 top-0 z-40 h-full w-full bg-black/50">
        <div class="relative top-1/4 mx-auto max-w-lg rounded border bg-zinc-800 p-4 drop-shadow-md">
          <div class="mb-4 flex justify-between">
            <h1 class="text-xl font-bold text-zinc-100">{props.title}</h1>
            <button
              class="p-1 hover:bg-zinc-700"
              onclick={() => props.setShowModal(false)}
            >
              <CloseIcon />
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </div>
  );
}
