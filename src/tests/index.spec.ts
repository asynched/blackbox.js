import { createBox } from '../index'

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

  describe('box.get()', () => {
    it("should return the box's inner state.", () => {
      const box = createBox(innerState)
      expect(box.get()).toEqual(innerState)
    })
  })

  describe('box.update()', () => {
    it('should mutate the internal state of the box.', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      box.update((state) => {
        state.city = expected.city
        state.country = expected.country
      })

      expect(box.get()).toEqual(expected)
    })
  })

  describe('box.update()', () => {
    it('should update the internal state of the box with the given value', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      box.set(expected)

      expect(box.get()).toEqual(expected)
    })
  })

  describe('box.reset()', () => {
    it('should reset the internal state of the box to the initial value.', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      box.set(expected)
      box.reset()

      expect(box.get()).toEqual(innerState)
    })
  })

  describe('box.subscribe()', () => {
    it('should trigger a callback when the state is updated', () => {
      const box = createBox(innerState)

      const expected = {
        city: 'Campinas',
        country: 'Brazil',
      }

      const callback = jest.fn()

      box.subscribe(callback)

      box.set(expected)

      expect(callback).toHaveBeenCalledWith(expected)
    })

    it('should return a function to unsubscribe the callback', () => {
      const box = createBox(innerState)

      const callback = jest.fn()

      const unsubscribe = box.subscribe(callback)

      unsubscribe()

      box.set({ city: 'Campinas' })

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
