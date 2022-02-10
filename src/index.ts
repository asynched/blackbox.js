import React, { useEffect, useState } from 'react'

declare namespace Blackbox {
  /**
   * Box subscriber function.
   */
  type BoxSubscriberType<A> = (value: A) => void

  /**
   * Mutation function to update the internal state
   * of the box.
   */
  type BoxMutationType<A> = (state: A) => A

  /**
   * Function to unsubscribe from the box state changes.
   */
  type BoxUnsubscribeType = () => void

  /**
   * Reactive blackbox object
   */
  type BoxType<A> = {
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
    set: (handler: BoxMutationType<A>) => void
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
    subscribe: (subscriber: BoxSubscriberType<A>) => BoxUnsubscribeType
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
export default function createBox<A extends {}>(state: A): Blackbox.BoxType<A> {
  // Set the internal state to be a copy of the object passed to it.
  // Important for avoiding reference mutations.
  let internalState = { ...state }

  // Internal state for the subscribers.
  let subscribers: Array<Blackbox.BoxSubscriberType<A>> = []

  let subscribe = (subscriber: Blackbox.BoxSubscriberType<A>) => {
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

  let get = () => ({ ...internalState })

  let set = (handler: Blackbox.BoxMutationType<A>) => {
    // Throw an error if the handler is not a function.
    if (typeof handler !== 'function') {
      throw new Error('Mutation handler must be a function')
    }

    // Invoke the mutation handler with the internal state.
    // The spread operator is important to trigger a new
    // react render, since it wont render if the object
    // reference is the same as passed.
    internalState = handler({ ...internalState })

    // Trigger all subscriber functions with the new state.
    subscribers.forEach((subscriber) => subscriber(internalState))
  }

  return {
    subscribe,
    get,
    set,
  }
}

/**
 * Function to register a form field to the mutations
 * of the internal box.
 */
type RegisterFunctionType<A> = (key: keyof A) => {
  value: A[keyof A]
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
export function useBox<A>(box: Blackbox.BoxType<A>): A {
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
export function useBoxForm<A>(
  box: Blackbox.BoxType<A>
): [A, RegisterFunctionType<A>] {
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
