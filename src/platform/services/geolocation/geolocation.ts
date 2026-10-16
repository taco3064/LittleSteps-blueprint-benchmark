/** Property detection preserves the caller's existing browser capability policy. */
export function hasGeolocationProperty(): boolean {
  return 'geolocation' in navigator;
}

/** Some browsers keep the property but expose a null value when disabled. */
export function hasGeolocationValue(): boolean {
  return Boolean(navigator.geolocation);
}

export function requestCurrentPosition(
  onSuccess: PositionCallback,
  onError: PositionErrorCallback,
  options?: PositionOptions,
): void {
  if (options === undefined) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    return;
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}
