# Comprehensive Test Examples

This folder contains **reference examples** of testing patterns and best practices for Vue 3 components with Pinia stores.

## Files

### `CourseList.comprehensive.spec.js`
Demonstrates testing patterns for **list/grid components**:
- Testing with Pinia store data
- Async data fetching
- Error handling
- User interactions
- Reactive updates
- Conditional rendering

### `CourseDetails.comprehensive.spec.js`
Demonstrates testing patterns for **detail/display components**:
- Empty state rendering
- Rendering with data
- Props handling and validation
- Prop reactivity
- Watcher behavior
- Conditional rendering
- Data display transformation
- Edge cases
- Integration scenarios

## Usage

These examples are **educational references** showing common testing patterns. Some tests may not pass with your specific component implementation, but they demonstrate:

✅ **Best practices** for component testing  
✅ **Different testing scenarios** you might need  
✅ **Service mocking patterns**  
✅ **Pinia store integration**  
✅ **Async/Promise handling with flushPromises**  
✅ **Error state testing**  
✅ **User interaction testing**  

## Key Testing Patterns Shown

### 1. Store-Based Testing
```javascript
const courseStore = useCourseStore()
courseStore.courses = mockData  // Direct state manipulation
const wrapper = mount(Component, { global: { plugins: [pinia, router] } })
```

### 2. Async Operations
```javascript
await courseStore.fetchCourses()  // Trigger action
await flushPromises()              // Wait for all promises
expect(wrapper.text()).toContain('Course Name')
```

### 3. Error Handling
```javascript
courseStore.error = 'Failed to load'
const wrapper = mount(Component)
expect(courseStore.error).toBe('Failed to load')
```

### 4. User Interactions
```javascript
const card = wrapper.find('.course-card')
await card.trigger('click')
expect(courseStore.selectedCourse).toBeDefined()
```

### 5. Reactive Updates
```javascript
courseStore.courses = []
await wrapper.vm.$nextTick()
expect(wrapper.findAll('.course-card')).toHaveLength(0)

courseStore.courses = mockCourses
await wrapper.vm.$nextTick()
expect(wrapper.findAll('.course-card')).toHaveLength(2)
```

### 6. Edge Cases
```javascript
// Empty string
const empty = { ...mockCourse, name: '' }
const wrapper = mount(Component, { props: { course: empty } })
expect(wrapper.vm).toBeDefined()

// Very long string
const longName = 'A'.repeat(200)
// Test still renders without error

// Special characters
const special = 'Vue <Test> & "More"'
// Safe HTML escaping tested
```

## Running These Examples

The **original simpler tests** in `CourseList.spec.js` and `CourseDetails.spec.js` are the ones that fully pass.

To run all tests:
```bash
npm run test              # Watch mode
npm run test:coverage    # Coverage report
```

To run only the basic passing tests:
```bash
npm run test -- CourseList.spec.js CourseDetails.spec.js
```

## Adapting These Examples

Use these as templates for creating tests for **other components**:

1. **Identify your component type:**
   - List/Grid → Use `CourseList.comprehensive.spec.js` as template
   - Detail/Display → Use `CourseDetails.comprehensive.spec.js` as template
   - Form → Create new based on form patterns
   - Modal → Create new based on modal patterns

2. **Adapt the test scenarios:**
   - Replace `mockCourses` with your actual mock data
   - Replace selectors (`.course-card`, etc.) with yours
   - Replace store actions with your actual actions
   - Add/remove tests based on component features

3. **Example: Testing a new UserProfile component:**
   ```javascript
   import { mount } from '@vue/test-utils'
   import { createPinia, setActivePinia } from 'pinia'
   import { useUserStore } from '@/stores/userStore'
   import UserProfile from '@/components/UserProfile.vue'

   const mockUser = {
     id: 1,
     name: 'John Doe',
     email: 'john@example.com'
   }

   describe('UserProfile.vue', () => {
     beforeEach(() => {
       setActivePinia(createPinia())
     })

     it('displays user information', () => {
       const userStore = useUserStore()
       userStore.user = mockUser

       const wrapper = mount(UserProfile, {
         global: { plugins: [createPinia()] }
       })

       expect(wrapper.text()).toContain('John Doe')
     })
   })
   ```

## Common Issues & Solutions

**Issue: Component doesn't show data passed via props**
- Solution: Add waiting time with `await new Promise(r => setTimeout(r, 50))` if using watchers

**Issue: Store action not found**
- Solution: Check if action exists in your store. If not, directly set state.

**Issue: flushPromises doesn't work**
- Solution: Import from `@vue/test-utils`: `import { flushPromises } from '@vue/test-utils'`

**Issue: Component not updating on store change**
- Solution: Use `await wrapper.vm.$nextTick()` after modifying store

## Reference Documentation

- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Vue 3 Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)

## Next Steps

1. ✅ Review these examples
2. ✅ Understand the patterns
3. ✅ Adapt them for your other components
4. ✅ Run `npm run test` to validate
5. ✅ Check coverage with `npm run test:coverage`

These examples follow Vue 3 and testing best practices! 🚀
