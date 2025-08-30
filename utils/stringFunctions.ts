/*
string functions

*/

// 첫 글자 대문자 변환
export function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
