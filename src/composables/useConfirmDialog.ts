import { Ref } from 'vue'
import { createEventHook } from './createEventHook'

export function useConfirmDialog(show: Ref<boolean>, fn: Function) {
  const confirmHook = createEventHook<any>()
  const cancelHook = createEventHook<any>()


  const showDialog = () => {
    show.value = true
    fn()
  }
  const confirm = (data = null) => {
    show.value = false
    confirmHook.trigger(data)
    confirmHook.off(() => { show.value = false })
  }
  const cancel = (error = null) => {
    show.value = false
    cancelHook.trigger(error)
  }
  return { showDialog, confirm, cancel, onConfirm: confirmHook.on, onCancel: cancelHook.on }
}
