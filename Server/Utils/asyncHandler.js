const asyncHandler = (fn) => async (...args) => {
  try {
    return await fn(...args)
  } catch (error) {
    console.log(error)
  }
}
export { asyncHandler }