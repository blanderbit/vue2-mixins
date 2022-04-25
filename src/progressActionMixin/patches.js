export const randomArrayItemsFromInitialArray = (arr) => {
  const workArray = [...arr]
  let j, temp
  for (let i = workArray.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    temp = workArray[j]
    workArray[j] = workArray[i]
    workArray[i] = temp
  }
  return workArray
}
