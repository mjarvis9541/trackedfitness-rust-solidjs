export function classNames(...args: any[]) {
  return args.filter(Boolean).join(" ");
}

export function titleCase(str: string) {
  let str_list = str.toLowerCase().split(" ");
  for (var i = 0; i < str_list.length; i++) {
    str_list[i] = str_list[i].charAt(0).toUpperCase() + str_list[i].slice(1);
  }
  return str_list.join(" ");
}

export function stripUnderscore(str: string) {
  return str.replace("_", " ");
}

export function stripUnderscoreTitleCase(str: string) {
  let str_list = str.toLowerCase().split("_");
  for (var i = 0; i < str_list.length; i++) {
    str_list[i] = str_list[i].charAt(0).toUpperCase() + str_list[i].slice(1);
  }
  return str_list.join(" ");
}
