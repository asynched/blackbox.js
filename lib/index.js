var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useEffect, useState } from 'react';
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
export default function createBox(state) {
    // Set the internal state to be a copy of the object passed to it.
    // Important for avoiding reference mutations.
    var internalState = __assign({}, state);
    // Internal state for the subscribers.
    var subscribers = [];
    var subscribe = function (subscriber) {
        // Throw an error if the subscriber is not a function.
        if (typeof subscriber !== 'function') {
            throw new Error('Subscriber must be a function');
        }
        // Add subscriber function to the subscribers array.
        subscribers.push(subscriber);
        // Return an unsubscribe function that removes the original
        // subscriber from the array.
        return function () {
            var index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    };
    var get = function () { return (__assign({}, internalState)); };
    var set = function (handler) {
        // Throw an error if the handler is not a function.
        if (typeof handler !== 'function') {
            throw new Error('Mutation handler must be a function');
        }
        // Invoke the mutation handler with the internal state.
        // The spread operator is important to trigger a new
        // react render, since it wont render if the object
        // reference is the same as passed.
        internalState = handler(__assign({}, internalState));
        // Trigger all subscriber functions with the new state.
        subscribers.forEach(function (subscriber) { return subscriber(internalState); });
    };
    return {
        subscribe: subscribe,
        get: get,
        set: set,
    };
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
export function useBox(box) {
    // Set the state to the internal state of the box.
    var _a = useState(box.get()), state = _a[0], setState = _a[1];
    // Subscribe to the box's state when the component
    // is mounted. Important to return the unsubscribe
    // function to allow memory leaks.
    useEffect(function () { return box.subscribe(setState); }, []);
    return state;
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
export function useBoxForm(box) {
    var _a = useState(box.get()), state = _a[0], setState = _a[1];
    var register = function (key) { return ({
        // Binds the value of the form field to the
        // internal state of the box.
        value: state[key],
        // On change handler for the input field. When
        // the `key` change event is dispatched it will
        // trigger this function, which will update the
        // internal state of the box.
        onChange: function (e) {
            box.set(function (state) {
                var _a;
                return (__assign(__assign({}, state), (_a = {}, _a[key] = e.target.value, _a)));
            });
        },
    }); };
    // Subscribe to the box's state when the component
    // is mounted. Important to return the unsubscribe
    // function to allow memory leaks.
    useEffect(function () { return box.subscribe(setState); }, []);
    return [state, register];
}
//# sourceMappingURL=index.js.map