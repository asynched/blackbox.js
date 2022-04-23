import { useEffect, useState } from 'react'

export declare namespace Blackbox {
  export type GenericBlackboxObjectType = {
    [key: string | symbol | number]: any
  }

  /**
   * Box subscriber function.
   */
  export type BoxSubscriberCallbackType<A> = (value: A) => void

  /**
   * Mutation function to update the internal state
   * of the box.
   */
  export type BoxMutationCallbackType<A> = (state: A) => A

  /**
   * Function to unsubscribe from the box state changes.
   */
  export type BoxUnsubscribeCallbackType = () => void

  /**
   * Reactive blackbox object
   */
  export type BoxType<A> = {
    /**
     * # Get
     *
     * Getter for the state of the box.
     *
     * Returns the original object passed to the `createBox` function.
     */
    get: () => A

    /**
     * # Set
     *
     * Setter for the state of the box.
     *
     * Handles the setting of the state and triggers all subscriber
     * functions to be called with the newly internal state.
     *
     * @param handler A mutation handler for setting the state of the box.
     */
    set: (handler: BoxMutationCallbackType<A>) => void

    /**
     * # Update
     *
     * Updates the internal state of the box.
     *
     * Sets the internal state of the box with the matching value
     * passed to it.
     *
     * @param newState New internal state value.
     */
    update: (state: A) => void

    /**
     * # Subscribe
     *
     * Subscribe to the state of the box.
     *
     * Subscribe to all changes to the internal state of the box. When the
     * state is updated, it will trigger the subscriber functions with the
     * newly internal state.
     *
     * @param subscriber A subscriber function for listening to the state changes of
     * the current box.
     */
    subscribe: (
      subscriber: BoxSubscriberCallbackType<A>
    ) => BoxUnsubscribeCallbackType
  }

  /**
   * Generic observable box object.
   */
  export type ObservableBoxType<A> = Pick<BoxType<A>, 'get' | 'subscribe'>

  /**
   * Function to register a form field to the mutations
   * of the internal box.
   */
  type RegisterFunctionType<A> = (key: keyof A) => {
    value: A[keyof A]
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
}

/**
 * # copy
 *
 * Helper function to perform a shallow copy on a given value.
 *
 * ## Example
 *
 * ```typescript
 * const a = { a: 1 }
 * const b = copy(a)
 * b.a = 2
 * console.log(a.a) // 1
 * ```
 *
 * @param source The source value to be copied.
 * @returns A copy of the original argument passed to the function.
 */
function copy<A>(source: A): A {
  // If the source value isn't an object
  // or an array it can be returned by
  // itself.
  if (typeof source !== 'object') {
    return source
  }

  // If the source value is a function
  // it can't be copied, so just return
  // it.
  if (typeof source === 'function') {
    return source
  }

  // If the source value is an array,
  // a new array will be returned.
  if (Array.isArray(source)) {
    return [...source] as any
  }

  // If the source value is an object,
  // a new object will be returned.
  return {
    ...source,
  }
}

/**
 * # Create box
 *
 * Creates a 'box' object that follows the `BoxType` interface.
 * This object is a proxy for the internal state of the box and can be
 * subscribed to, allowing it's state to be observed.
 *
 * @param state The initial state of the box.
 * @returns A box object that can be subscribed to and mutated.
 */
export default function createBox<A>(state: A): Blackbox.BoxType<A> {
  // Set the internal state to be a copy of the object passed to it.
  // Important for avoiding reference mutations.
  let internalState = copy(state)

  // Internal state for the subscribers.
  let subscribers: Array<Blackbox.BoxSubscriberCallbackType<A>> = []

  let subscribe = (subscriber: Blackbox.BoxSubscriberCallbackType<A>) => {
    // Throw an error if the subscriber is not a function.
    if (typeof subscriber !== 'function') {
      throw new Error('Subscriber must be a function')
    }

    // Add subscriber function to the subscribers array.
    subscribers.push(subscriber)

    // Return an unsubscribe function that removes the original
    // subscriber from the array.
    return () => {
      let index = subscribers.indexOf(subscriber)

      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  let get = () => copy(internalState)

  let set = (handler: Blackbox.BoxMutationCallbackType<A>) => {
    // Throw an error if the handler is not a function.
    if (typeof handler !== 'function') {
      throw new Error('Mutation handler must be a function')
    }

    // Invoke the mutation handler with the internal state.
    // The spread operator is important to trigger a new
    // react render, since it won't render if the object
    // reference is the same as passed.
    internalState = handler(copy(internalState))

    // Trigger all subscriber functions with the new state.
    subscribers.forEach((subscriber) => subscriber(internalState))
  }

  let update = (state: A) => {
    internalState = copy(state)

    subscribers.forEach((subscriber) => subscriber(internalState))
  }

  return {
    subscribe,
    get,
    set,
    update,
  }
}

/**
 * # derive
 *
 * Helper function to use a slice of a given internal box state, it returns a new box
 * that is a proxy to the internal state of the original one.
 *
 * A derived box cannot be mutated.
 *
 * @param selectorFunction Function to select a slice of the internal state of a given box.
 * @param box Box to get the derived state from.
 * @returns A new observable box that can be subscribed to.
 */
export function derive<A, B>(
  box: Blackbox.BoxType<A>,
  selectorFunction: (state: A) => B
): Blackbox.ObservableBoxType<B> {
  let subscribers: Array<Blackbox.BoxSubscriberCallbackType<B>> = []

  box.subscribe((state) => {
    subscribers.forEach((subscriber) => {
      subscriber(selectorFunction(state))
    })
  })

  const get = () => {
    // Applies selector function to the internal
    // box state and returns the result.
    return selectorFunction(box.get())
  }

  const subscribe = (
    subscriber: Blackbox.BoxSubscriberCallbackType<B>
  ): Blackbox.BoxUnsubscribeCallbackType => {
    if (typeof subscriber !== 'function') {
      throw new Error('Subscriber must be a function')
    }

    // Works the same as the box subscribe function but
    // subscribes to the internal subscribers array.
    subscribers.push(subscriber)

    return () => {
      let index = subscribers.indexOf(subscriber)

      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  return {
    get,
    subscribe,
  }
}

/**
 * # Use box
 *
 * Helper hook for interacting with a box object and react.
 * This will get the internal state of the box and subscribe
 * to it's changes.
 *
 * @param box Box object to get the state from.
 * @returns The state of the original box passed to it.
 */
export function useBox<A>(box: Blackbox.ObservableBoxType<A>): A {
  // Set the state to the internal state of the box.
  const [state, setState] = useState(box.get())

  // Subscribe to the box's state when the component
  // is mounted. Important to return the unsubscribe
  // function to allow memory leaks.
  useEffect(() => box.subscribe(setState), [])

  return state
}

/**
 * # Use box form
 *
 * Helper hook to do two way data binding between a box
 * and the UI elements.
 *
 * # Example
 *
 * ```typescript
 * // Outside your react component.
 * const box = createBox({ name: 'Foo' })
 *
 * // Inside your react component.
 * const [state, register] = useBoxAsForm(box)
 * return (<input {...register('name')} />)
 * ```
 *
 * @param box Box object to subscribe the events to.
 * @returns A tuple containing the form state and a function to
 * register for changes in the UI.
 */
export function useBoxForm<A extends Blackbox.GenericBlackboxObjectType>(
  box: Blackbox.BoxType<A>
): [A, Blackbox.RegisterFunctionType<A>] {
  const [state, setState] = useState(box.get())

  const register = (key: keyof A) => ({
    // Binds the value of the form field to the
    // internal state of the box.
    value: state[key],
    // On change handler for the input field. When
    // the `key` change event is dispatched it will
    // trigger this function, which will update the
    // internal state of the box.
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      box.set((state) => ({ ...state, [key]: e.target.value }))
    },
  })

  // Subscribe to the box's state when the component
  // is mounted. Important to return the unsubscribe
  // function to allow memory leaks.
  useEffect(() => box.subscribe(setState), [])

  return [state, register]
}

/**
 * # Use derived box
 *
 * Helper hook to get a slice of the box inner state.
 *
 * ## Example
 *
 * ```typescript
 * const sourceBox = createBox({ names: ['foo', 'bar', 'baz'] })
 * const namesBox = useDerivedBox((state) => state.names, sourceBox)
 * ```
 *
 * @param selectorFunction Selector function to get the derived state of the box.
 * @param box Source box object to get the derived state from
 * @returns The derived state of the box.
 */
export function useDerivedBox<A, B>(
  box: Blackbox.ObservableBoxType<A>,
  selectorFunction: (state: A) => B
): B {
  const [state, setState] = useState(selectorFunction(box.get()))

  useEffect(() => {
    return box.subscribe((state) => {
      setState(selectorFunction(state))
    })
  }, [selectorFunction, box])

  return state
}
