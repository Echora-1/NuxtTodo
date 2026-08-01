export function requiredText(message: string) {
  return (value: unknown): true | string => {
    return typeof value === 'string' && value.trim().length > 0 ? true : message
  }
}
