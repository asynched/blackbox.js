/// <reference types="react" />
export declare namespace Blackbox {
    type GenericBlackboxObjectType = {
        [key: string | symbol | number]: any;
    };
    /**
     * Box subscriber function.
     */
    type BoxSubscriberCallbackType<A> = (value: A) => void;
    /**
     * Mutation function to update the internal state
     * of the box.
     */
    type BoxMutationCallbackType<A> = (state: A) => A;
    /**
     * Function to unsubscribe from the box state changes.
     */
    type BoxUnsubscribeCallbackType = () => void;
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
        get: () => A;
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
        set: (handler: BoxMutationCallbackType<A>) => void;
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
        update: (state: A) => void;
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
        subscribe: (subscriber: BoxSubscriberCallbackType<A>) => BoxUnsubscribeCallbackType;
    };
    /**
     * Generic observable box object.
     */
    type ObservableBoxType<A> = Pick<BoxType<A>, 'get' | 'subscribe'>;
    /**
     * Function to register a form field to the mutations
     * of the internal box.
     */
    type RegisterFunctionType<A> = (key: keyof A) => {
        value: A[keyof A];
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };
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
export default function createBox<A>(state: A): Blackbox.BoxType<A>;
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
export declare function derive<A, B>(box: Blackbox.BoxType<A>, selectorFunction: (state: A) => B): Blackbox.ObservableBoxType<B>;
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
export declare function useBox<A>(box: Blackbox.ObservableBoxType<A>): A;
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
export declare function useBoxForm<A extends Blackbox.GenericBlackboxObjectType>(box: Blackbox.BoxType<A>): [A, Blackbox.RegisterFunctionType<A>];
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
export declare function useDerivedBox<A, B>(box: Blackbox.ObservableBoxType<A>, selectorFunction: (state: A) => B): B;
