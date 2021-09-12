import { Fn, pausableFilter, ignorableWatch, debounceFilter, throttleFilter } from '@vueuse/shared'
import { Ref } from 'vue'
import { useManualRefHistory, useDebounceFn } from '@vueuse/core'

export function useDebouncedRefHistory(source: any, options: any, ms: number) {

  const {
    deep = false,
    flush = 'pre',
    // eventFilter: userFilter
  } = options

  const { eventFilter, pause, resume: resumeTracking, isActive: isTracking } = pausableFilter(debounceFilter(ms))
  const { ignoreUpdates, ignorePrevAsyncUpdates, stop } = ignorableWatch(
    source,
    commit,
    { deep, flush, eventFilter },
  )

  function setSource(source: Ref<any>, value: any) {
    // Support changes that are done after the last history operation
    // examples:
    //   undo, modify
    //   undo, undo, modify
    // If there were already changes in the state, they will be ignored
    // examples:
    //   modify, undo
    //   undo, modify, undo
    ignorePrevAsyncUpdates()

    ignoreUpdates(() => {
      source.value = value
    })
  }

  const manualHistory = useManualRefHistory(source, { ...options, clone: options.clone || deep, setSource })

  const { clear, commit: manualCommit } = manualHistory

  // const debounsedCommit = useDebounceFn(() => {
  //   console.log('debounce commit')
  //   manualCommit()
  // }, ms)

  function commit() {

    // This guard only applies for flush 'pre' and 'post'
    // If the user triggers a commit manually, then reset the watcher
    // so we do not trigger an extra commit in the async watcher

    console.log('commit')
    // pause()
    ignorePrevAsyncUpdates()
    manualCommit()
    // debounsedCommit()
    // resume()
    // manualCommit()
  }
  // function commit() 

  function resume(commitNow?: boolean) {
    resumeTracking()
    if (commitNow)
      commit()
  }

  function batch(fn: (cancel: Fn) => void) {
    let canceled = false

    const cancel = () => canceled = true

    ignoreUpdates(() => {
      fn(cancel)
    })

    if (!canceled)
      commit()
  }

  function dispose() {
    stop()
    clear()
  }

  return {
    ...manualHistory,
    isTracking,
    pause,
    resume,
    commit,
    batch,
    dispose,
  }
}