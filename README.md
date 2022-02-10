# Blackbox.js

A state management library for React. 📦

## How to install

Install it with NPM using

```sh
$ npm i --save blackbox.js
```

## Usage

Blackbox aims to deal with state inside React as easily as possible, without having to deal with boiler plate code like reducers, switch statements or providers for your state. You're encouraged to deal with your state as easily as possible.

You can start declaring your store (or blackbox) with the `createBox` method. In the example below, you can see an example of a store with a person object.

```ts
import createBox from 'blackbox.js'

const person = {
  name: 'Foo',
}

const personBox = createBox(person)
```

> This will create a reactive state box that can be listened. 👂

### Foundations

The box object is based on the observer design pattern, which allows any function to subscribe to it's internal state, allowing you to use it outside React, for example.

You can use this with vanilla js (although not recommended) as show below:

```ts
import createBox from 'blackbox.js'

const personBox = createBox({
  name: 'foo',
})

personBox.subscribe((state) => {
  const p = document.querySelector('p')

  p.innerText = `Your name is: ${state.name}`
})

const button = document.querySelector('button')

button.addEventListener('click', () =>
  personBox.set((state) => {
    state.name = 'Bar'
    return state
  })
)
```

### React ⚛️

Although it can be used outside React, using the library is where the main focus of the library is: Allowing for declarative and simple state management without boiler plate.

Let's start with an example of a simple person object that must be reactive

```tsx
import React from 'react'
import createBox, { useBox } from 'blackbox.js'

const personBox = createBox({
  name: 'Foo',
})

function App() {
  const box = useBox(personBox)

  return (
    <div>
      <h1>Hello, {box.name}!</h1>
    </div>
  )
}
```

As the above code shows, all you have to do is declare a box object (`personBox` in the example) and provide it to the `useBox` hook.

**But what if I wanted to make it reactive?**

Using the above code as an example, it is encouraged to declare your `actions` or `mutations` for the box object when it's declared, allowing only a set of actions to be dispatched (although you can use the `.set` method anywhere). A good rule of thumb is that "flexibility comes with a cost".

In the example below we show how to use it both ways.

```tsx
import React from 'react'
import createBox, { useBox } from 'blackbox.js'

const personBox = createBox({
  name: 'Foo',
})

const personMutations = {
  setName(name: string) {
    personBox.set((state) => {
      state.name = name
      return state
    })
  },
}

function App() {
  const box = useBox(personBox)

  const handleClick = () => {
    // Set using the set method inside
    // the box object (discouraged).
    if (false) {
      return personBox.set((state) => {
        state.name = 'Bar'
      })
    }

    // Easier to reason about (encouraged).
    personMutations.setName('Bar')
  }

  return (
    <div>
      <h1>Hello, {box.name}!</h1>
      <button onClick={handleClick}>Change name</button>
    </div>
  )
}
```

## Author

| ![Eder Lima](https://github.com/asynched.png?size=100) |
| ------------------------------------------------------ |
| [Eder Lima](https://github.com/asynched)               |
