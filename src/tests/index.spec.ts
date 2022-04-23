import createBox, { derive } from '../index'
import type { Blackbox } from '../index'

describe('createBox()', () => {
  let innerState = {
    city: 'São Paulo',
    country: 'Brazil',
  }

  beforeEach(() => {
    innerState = {
      city: 'São Paulo',
      country: 'Brazil',
    }
  })

  it('should be able to create a box.', () => {
    const box = createBox(innerState)
    expect(box).toBeInstanceOf(Object)
  })

  it('should be able to create a box with a primitive.', () => {
    const box = createBox('foo')
    expect(box).toBeInstanceOf(Object)
  })

  describe('box.get()', () => {
    it("should return the box's inner state.", () => {
      const box = createBox(innerState)
      expect(box.get()).toEqual(innerState)
    })

    it("should return the box's inner state when created with a primitive.", () => {
      const box = createBox('foo')
      expect(box.get()).toEqual('foo')
    })
  })

  describe('box.set()', () => {
    it('should mutate the internal state of the box.', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      box.set((state) => {
        state.city = expected.city
        state.country = expected.country
        return state
      })

      expect(box.get()).toEqual(expected)
    })

    it('should mutate the internal state of the box when it is a primitive.', () => {
      const box = createBox(0)

      box.set((state) => state + 1)

      expect(box.get()).toBe(1)
    })
  })

  describe('box.update()', () => {
    it('should update the internal state of the box with the given value', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      box.update(expected)

      expect(box.get()).toEqual(expected)
    })

    it('should update the internal state of the box with the given primitive value', () => {
      const box = createBox(10)
      const expected = 20

      box.update(expected)
      expect(box.get()).toBe(expected)
    })
  })

  describe('box.subscribe()', () => {
    it('should be able to subscribe to a box state update', (done) => {
      const box = createBox(0)
      const expected = 10

      box.subscribe((state) => {
        expect(state).toBe(expected)
        done()
      })

      box.update(expected)
    })

    it('should trigger a callback when the ".update()" method is called', (done) => {
      const box = createBox(0)
      const expected = 10

      box.subscribe((state) => {
        expect(state).toBe(10)
        done()
      })

      box.update(expected)
    })

    it('should trigger a callback when the ".set()" method is called', (done) => {
      const box = createBox(0)
      const expected = 10

      box.subscribe((state) => {
        expect(state).toBe(10)
        done()
      })

      box.set(() => expected)
    })
  })
})

describe('derive()', () => {
  const state = {
    city: 'São Paulo',
    country: 'Brazil',
  }

  type State = typeof state

  let box: Blackbox.BoxType<State>
  const identity = <A>(value: A) => value

  beforeEach(() => {
    box = createBox(state)
  })

  it('should create a derived box.', () => {
    const derived = derive(box, identity)

    expect(derived).toBeInstanceOf(Object)
  })

  describe('derived.get()', () => {
    let derived: Blackbox.ObservableBoxType<string>

    beforeEach(() => {
      derived = derive(box, (state) => state.city)
    })

    it('should get the internal state of the box.', () => {
      const expected = state.city
      expect(derived.get()).toBe(expected)
    })
  })

  describe('derived.subscribe()', () => {
    let derived: Blackbox.ObservableBoxType<string>

    beforeEach(() => {
      derived = derive(box, (state) => state.city)
    })

    it('should trigger a callback when the original box state is mutated.', (done) => {
      const expected = 'Campinas'

      derived.subscribe((city) => {
        expect(city).toBe(expected)
        done()
      })

      box.set((state) => ({ ...state, city: expected }))
    })
  })
})
