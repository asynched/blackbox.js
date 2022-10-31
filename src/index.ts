import { useEffect, useState } from 'react'

type GenericBox = Record<string, unknown>
type Subscriber<T> = (value: T) => void

const clone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value))
}

type BlackBox<T extends GenericBox> = {
  /**
   * Helper method to get the inner value of a box.
   *
   * @example
   * const box = createBox({ message: 'Hello, world!' })
   * const state = box.get()
   *
   * @returns The inner value of the box.
   */
  get: () => T
  /**
   * Helper method to set the inner value of a box.
   *
   * @example
   * const box = createBox({ message: 'Hello, world!' })
   * box.set({ message: 'Hello, world! How are you?' })
   *
   * @param value The new property to be updated.
   */
  set: (value: Partial<T>) => void
  /**
   * Helper method to subscribe to changes in a box.
   *
   * @example
   * const box = createBox({ message: 'Hello, world!' })
   * box.subscribe((value) => console.log(value))
   *
   * box.set({ message: 'Ayy!' }) // Will log the value to the console.
   *
   * @param subscriber The function to be called when the box is updated.
   * @returns A function to unsubscribe from the box.
   */
  subscribe: (subscriber: Subscriber<T>) => () => void
  /**
   * Helper method to update the inner value of a box.
   *
   * @example
   * const box = createBox({ message: 'Hello, world!' })
   *
   * box.update((state) => {
   *   state.message = 'Ayy!'
   * })
   *
   * @param updater The function that will update the inner value of the box.
   */
  update: (updater: (value: T) => void) => void
  /**
   * Sets the inner state to be the initial value provided.
   *
   * @example
   * const box = createBox({ message: 'Hello, world!' })
   *
   * box.reset()
   */
  reset: () => void
}

/**
 * Creates a box that can be used to store and update state.
 *
 * @param value The initial value of the box.
 * @returns A black box that can be used to store and update state.
 */
export function createBox<T extends GenericBox>(value: T): BlackBox<T> {
  let inner = value
  const zero = clone(value)
  const subscribers: Array<Subscriber<T>> = []

  const reset = () => {
    inner = zero
  }

  const get = () => {
    return inner
  }

  const set = (value: Partial<T>) => {
    inner = Object.assign({}, inner, value)
    subscribers.forEach((subscriber) => subscriber(inner))
  }

  const update = (updater: (value: T) => void) => {
    const clone = Object.assign({}, inner)

    updater(clone)
    inner = clone

    subscribers.forEach((subscriber) => subscriber(inner))
  }

  const subscribe = (subscriber: Subscriber<T>) => {
    subscribers.push(subscriber)

    return () => {
      const index = subscribers.indexOf(subscriber)
      subscribers.splice(index, 1)
    }
  }

  return {
    get,
    set,
    update,
    subscribe,
    reset,
  }
}

/**
 * # useBox
 *
 * A React hook to use a box in a component.
 *
 * @param box Box to be used in the component.
 * @returns The inner value of the box.
 */
export function useBox<T extends GenericBox>(box: BlackBox<T>): T {
  const [state, setState] = useState(box.get())

  useEffect(() => {
    return box.subscribe(setState)
  }, [box])

  return state
}
