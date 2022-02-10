import React from 'react';
declare namespace Blackbox {
    /**
     * Box subscriber function.
     */
    type BoxSubscriberType<A> = (value: A) => void;
    /**
     * Mutation function to update the internal state
     * of the box.
     */
    type BoxMutationType<A> = (state: A) => A;
    /**
     * Function to unsubscribe from the box state changes.
     */
    type BoxUnsubscribeType = () => void;
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
        set: (handler: BoxMutationType<A>) => void;
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
        subscribe: (subscriber: BoxSubscriberType<A>) => BoxUnsubscribeType;
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
export default function createBox<A extends {}>(state: A): Blackbox.BoxType<A>;
/**
 * Function to register a form field to the mutations
 * of the internal box.
 */
declare type RegisterFunctionType<A> = (key: keyof A) => {
    value: A[keyof A];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
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
export declare function useBox<A>(box: Blackbox.BoxType<A>): A;
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
export declare function useBoxForm<A>(box: Blackbox.BoxType<A>): [A, RegisterFunctionType<A>];
export {};
