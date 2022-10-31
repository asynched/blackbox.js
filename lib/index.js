import { useEffect, useState } from 'react';
var clone = function (value) {
    return JSON.parse(JSON.stringify(value));
};
/**
 * Creates a box that can be used to store and update state.
 *
 * @param value The initial value of the box.
 * @returns A black box that can be used to store and update state.
 */
export function createBox(value) {
    var inner = value;
    var zero = clone(value);
    var subscribers = [];
    var reset = function () {
        inner = zero;
    };
    var get = function () {
        return inner;
    };
    var set = function (value) {
        inner = Object.assign({}, inner, value);
        subscribers.forEach(function (subscriber) { return subscriber(inner); });
    };
    var update = function (updater) {
        var clone = Object.assign({}, inner);
        updater(clone);
        inner = clone;
        subscribers.forEach(function (subscriber) { return subscriber(inner); });
    };
    var subscribe = function (subscriber) {
        subscribers.push(subscriber);
        return function () {
            var index = subscribers.indexOf(subscriber);
            subscribers.splice(index, 1);
        };
    };
    return {
        get: get,
        set: set,
        update: update,
        subscribe: subscribe,
        reset: reset,
    };
}
/**
 * # useBox
 *
 * A React hook to use a box in a component.
 *
 * @param box Box to be used in the component.
 * @returns The inner value of the box.
 */
export function useBox(box) {
    var _a = useState(box.get()), state = _a[0], setState = _a[1];
    useEffect(function () {
        return box.subscribe(setState);
    }, [box]);
    return state;
}
//# sourceMappingURL=index.js.map