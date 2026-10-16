export function genderText(gender?: string): string {
  if (gender === 'male') {
    return '男';
  }

  if (gender === 'female') {
    return '女';
  }

  return '未設定';
}
