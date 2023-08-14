// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import email from 'src/store/apps/email'
import user from 'src/store/apps/user'

export const store = configureStore({
  reducer: {
    email,
    user
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
