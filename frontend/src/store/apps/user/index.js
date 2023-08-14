// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Api Hook Import
import { API_URL } from 'src/configs'

// ** Get Current Mail
export const getUserByEmail = createAsyncThunk('appUser/getUser', async params => {
  const response = await axios.post(`${API_URL}/users`, params, {
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
    }
  })
  return response.data
})

export const appUserSlice = createSlice({
  name: 'appUser',
  initialState: {
    users: null
  },
})

export default appUserSlice.reducer
