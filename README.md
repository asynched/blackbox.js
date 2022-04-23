# Blackbox.js

Blackbox is a predictable, boilerplate free state management library for React. 📦

It's designed specifically for React applications, so you don't have to worry about installing other third party packages.

> And it's tiny! 🤏

## Index

1. [Blackbox](#blackboxjs)
2. [Index](#index)
3. [Installation](#installation)
4. [Learn](#learn)
   1. [The gist](#the-gist)
   2. [React](#react-⚛️)

## Installation

Assuming your using _npm_ as your package manager, install it typing the command below in your terminal:

```sh
$ npm i blackbox.js
```

## Learn 🤓

Blackbox is a library designed for you to deal with globally shared state as easily as possible, without introducing any boiler plate code like reducers, switch statements or providers. With it, you're encouraged to do things as simple as possible.

Similar to other flux-like libraries, it's architecture is based on the _single source of truth_ principle, where the state is a single global instance in your app, making it easier to reason about where the state and actions are coming from.

### The gist 🧠

As said previously, blackbox is designed to give you a simple and boilerplate free API for dealing with your state. All you have to do is to create a globally available _box_ object to share between your components.

The example below shows the usage of it with a simple counter app.

```typescript
import createBox from 'blackbox.js'

// Creates a reactive box object that'll
// update and trigger any subscribers.
const counterBox = createBox(0)

/**
 * This is an action, an action is the preferred way to
 * interact with your state.
 *
 * We define them as functions that when triggered,
 * updated the internal state of a box.
 *
 * In this case, then the function "increment" is called we
 * increment the counter by the parameter "incrementBy".
 *
 * Declaring well defined actions will make your life easier
 * in the long run, since everything will be mapped to a
 * function. 😸
 *
 */
function increment(incrementBy = 1) {
  counterBox.set((counter) => counter + incrementBy)
}

/**
 * Since we've defined an action to increment the counter previously, the
 * "decrement" can call the "increment" with a negative value.
 *
 * In this function you can see that actions can call other actions or either
 * call themselves!
 */
function decrement() {
  increment(-1)
}

counterBox.subscribe(console.log) // This will log any changes in the internal box state for us.

/**
 * As seen below, both calls are independent of the component
 * context and don't need a hook to be triggered.
 *
 * We'll see how it's used inside a component in the section below.
 */
increment() // Increments the counter
decrement() // Decrements the counter
```

### React ⚛️

Building on the previous example, blackbox provides you with hooks you can use to flatten a _box_ object to it's original state and make it reactive. We'll build a counter app with the previous actions to show you how easy it is.

```tsx
import React from 'react'
import createBox, { useBox } from 'blackbox.js'

// As shown in the previous example, you can
// create a box from any value. We are using
// zero as the initial state for the box.
const counterBox = useBox(0)

/**
 * Our user-defined action to increment the
 * counter by a value (which defaults to one).
 */
function increment(incrementBy = 1) {
  counterBox.set((counter) => counter + incrementBy)
}

/**
 * Another action to decrement the counter by one.
 */
function decrement() {
  increment(-1)
}

/**
 * In here, we're using the "useBox" hook to flatten the
 * box object to it's original value (zero).
 *
 * This hook makes the counter reactive to triggered actions
 * and deals automatically with the subscription management
 * and cleanup.
 */
export default function App() {
  const counter = useBox(counterBox) // This will flatten the box to the zero value.

  return (
    <div>
      <h1>Counter is: {counter}</h1>
      <div>
        <button onClick={() => increment()}>Increment</button>
        <button onClick={() => decrement()}>Decrement</button>
      </div>
    </div>
  )
}
```

## Examples 📔

- [Expense tracker with Blackbox.js and Tailwind 🍃](https://github.com/asynched/blackbox-expense-tracker)
- [Realtime websocket chat app with Blackbox.js 📬](https://github.com/asynched/websocket-chat-app)

## License 💼

[MIT](https://github.com/asynched/blackbox.js/blob/master/LICENSE)

## Author

| ![Eder Lima](https://github.com/asynched.png?size=100) |
| ------------------------------------------------------ |
| [Eder Lima](https://github.com/asynched)               |
