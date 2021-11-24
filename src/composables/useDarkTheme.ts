import { ref, computed } from 'vue'

const isDark = ref(false)

export const useDarkTheme = function () {

  const changeTheme = function () {
    isDark.value = !isDark.value
  }

  return {
    isDark: computed(() => isDark.value),
    changeTheme
  }
}
