import { ref, onUnmounted } from "vue"

export const useWindowSize = function () {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function setWindowSizes() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  window.onresize = setWindowSizes

  onUnmounted(() => {
    window.removeEventListener("onresize", setWindowSizes)
  })

  return { width, height }
}